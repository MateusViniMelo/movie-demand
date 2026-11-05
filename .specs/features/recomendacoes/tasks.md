# Recomendações na home Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline no plano. Sem `design.md`.
**Status**: Done
**Approved**: 2026-11-05 - user: "Implement the plan as specified"
**Mutations**: 3
**Build**: `npm run lint; node --test; npm run build`

Commits suspensos: o plano desta feature proíbe `git commit`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Amostras: `tests/filme.test.mjs`, `tests/filme-ui.test.mjs`, `tests/busca.test.mjs`, `tests/home-fonte.test.mjs`. Runner real: `node --test`. Lint: `npm run lint`. Build: `npm run build`. Não há script `tsc`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Nota, guarda e resposta | unit | 1:1 com REC-01 a REC-03, REC-05, REC-07, REC-08, REC-11 a REC-29 | `tests/recomendacoes.test.mjs` | `node --test tests/recomendacoes.test.mjs` |
| Consulta | unit | O `findMany` pede id, título, pôster, coleção, votos, nota, gêneros e elenco | `tests/recomendacoes.test.mjs` | `node --test tests/recomendacoes.test.mjs` |
| Home e clique | unit | REC-04, REC-06, REC-09 e REC-10 no texto-fonte e no predicado dos títulos | `tests/recomendacoes-ui.test.mjs` | `node --test tests/recomendacoes-ui.test.mjs` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de tarefa com função pura ou contrato de tela | `node --test tests/recomendacoes.test.mjs` |
| Full | Depois de tarefa que mexe na home ou no pôster | `node --test tests/recomendacoes.test.mjs tests/recomendacoes-ui.test.mjs tests/home-fonte.test.mjs tests/filme-ui.test.mjs` |
| Build | Depois da última tarefa | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Sete tarefas, um lote, execução inline. Sem subagentes de implementação.

### Phase 1: Nota

```
T1
```

### Phase 2: Rota

```
T2 -> T3
```

### Phase 3: Clique

```
T4 -> T5
```

### Phase 4: Home

```
T6 -> T7
```

---

## Task Breakdown

### Phase 1: Nota

### T1: Nota, guarda e resposta

**What**: Cálculo puro, leitura da chave e decisão do status.
**Where**: `lib/recomendacoes.mjs`
**Depends on**: None
**Reuses**: `idDoFilme` e `urlDoPoster`
**Requirement**: REC-01, REC-02, REC-03, REC-05, REC-07, REC-08, REC-11, REC-12, REC-13, REC-14, REC-15, REC-16, REC-17, REC-18, REC-19, REC-20, REC-21, REC-22, REC-23, REC-24, REC-25, REC-26, REC-27, REC-28, REC-29

**Done when**:

- [x] A chave gravada é `{"versao":1,"filmeId":<id>}` e uma segunda gravação substitui a primeira
- [x] `setItem` que lança não estoura; `getItem` que lança devolve ausência
- [x] Valor ausente, JSON inválido, `versao` diferente de 1 e `filmeId` rejeitado por `idDoFilme` são ausência
- [x] A parte de gênero de origem `1,2` e candidato `1,1,3` é `0.25`; sem gênero é `0`
- [x] Coleção igual e não nula soma `0.3`; algum nulo soma `0`
- [x] Elenco cruzado nos 5 primeiros soma `0.15`; o sexto e a interseção vazia somam `0`
- [x] O conjunto de elenco guarda a menor ordem, ordena por ordem e `pessoaId`, e fica com 5
- [x] Elenco sozinho, o filme de origem e `posterPath` nulo ou `""` ficam de fora
- [x] Mais de 12 candidatos devolvem 12, na ordem nota, `votos`, `notaMedia`, `id`
- [x] Id inválido ou filme ausente devolve 404; filme sem candidato devolve 200 e `filmes` vazio
- [x] O cartaz usa `id`, `titulo` e `src` em `w500`
- [x] Leitura que lança devolve 500
- [x] `node --test tests/recomendacoes.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### Phase 2: Rota

### T2: Leitura do catálogo

**What**: `findMany` entrega as linhas no formato da nota.
**Where**: `lib/recomendacoes-db.ts`
**Depends on**: T1
**Reuses**: `prisma` e `filmeDaLinha`
**Requirement**: REC-27

**Done when**:

- [x] O `select` pede `id`, `titulo`, `posterPath`, `colecaoId`, `votos`, `notaMedia`, `generos.generoId` e `elencos.pessoaId` com `ordem`
- [x] A leitura passa por `filmeDaLinha` e `atenderRecomendacao`
- [x] `node --test tests/recomendacoes.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### T3: GET /api/recomendacoes

**What**: A rota lê `filme` e devolve o status da decisão.
**Where**: `app/api/recomendacoes/route.ts`
**Depends on**: T2
**Reuses**: `cabecalhoDaApi` e `carregarRecomendacoes`
**Requirement**: REC-05, REC-24, REC-25, REC-26, REC-28

**Done when**:

- [x] O query param é `filme`
- [x] O status e o corpo vêm de `carregarRecomendacoes`
- [x] A resposta manda `cabecalhoDaApi`
- [x] `node --test tests/recomendacoes.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### Phase 3: Clique

### T4: Pôster avisa o clique

**What**: O link do pôster continua `/filme/{id}` e chama `aoEscolher` no clique.
**Where**: `components/poster.tsx`
**Depends on**: T1
**Reuses**: `caminhoDoFilme`
**Requirement**: REC-01, REC-10

**Done when**:

- [x] O `href` permanece `caminhoDoFilme(filme.id)`
- [x] O `onClick` chama `aoEscolher` com `filme.id` quando a prop existe
- [x] `node --test tests/recomendacoes.test.mjs tests/recomendacoes-ui.test.mjs tests/home-fonte.test.mjs tests/filme-ui.test.mjs` passa

**Tests**: unit
**Gate**: full

---

### T5: Três fileiras gravam

**What**: Novidades, Mais bem avaliados e Filmes em Cartaz gravam o id.
**Where**: `components/fileira.tsx`
**Depends on**: T4
**Reuses**: `registrarClique`
**Requirement**: REC-01, REC-02, REC-04

**Done when**:

- [x] Com `gravaEscolha`, o pôster chama `registrarClique(localStorage, id)`
- [x] Sem `gravaEscolha`, o pôster não grava
- [x] `node --test tests/recomendacoes.test.mjs tests/recomendacoes-ui.test.mjs tests/home-fonte.test.mjs tests/filme-ui.test.mjs` passa

**Tests**: unit
**Gate**: full

---

### Phase 4: Home

### T6: Fileira Recomendações

**What**: O cliente lê a chave depois de montar e pede a rota.
**Where**: `components/recomendacoes.tsx`
**Depends on**: T3
**Reuses**: `Fileira`, `lerArmazenamento`, `pedidoDaRecomendacao`, `filmesDaResposta`
**Requirement**: REC-03, REC-05, REC-06, REC-07, REC-08, REC-10, REC-11, REC-12, REC-29

**Done when**:

- [x] Lista vazia não renderiza pôster
- [x] Filme ausente não pede a rota; filme presente pede `GET /api/recomendacoes?filme={id}`
- [x] Status diferente de 200 e corpo vazio não mostram a fileira
- [x] A fileira titulada `Recomendações` não passa `gravaEscolha`
- [x] O evento `storage` dessa chave relê; outra chave não
- [x] `getItem` que lança esconde a fileira
- [x] `node --test tests/recomendacoes.test.mjs tests/recomendacoes-ui.test.mjs tests/home-fonte.test.mjs tests/filme-ui.test.mjs` passa

**Tests**: unit
**Gate**: full

---

### T7: Fileira acima do catálogo

**What**: A home coloca Recomendações antes das três fileiras e liga `gravaEscolha`.
**Where**: `app/page.tsx`
**Depends on**: T5, T6
**Reuses**: `gravaEscolha` e `Recomendacoes`
**Requirement**: REC-04, REC-09

**Done when**:

- [x] `<Recomendacoes />` vem antes de `fileiras.map`
- [x] As fileiras de baixo recebem `gravaEscolha(fileira.titulo)`
- [x] `npm run lint && node --test && npm run build` passa

**Tests**: unit
**Gate**: build

---

## Checks

**C1** - O clique grava `{"versao":1,"filmeId":<id>}` e substitui o valor anterior (REC-01, AC 1)
Proof: `node --test --test-name-pattern "REC-01" tests/recomendacoes.test.mjs`

**C2** - Gravação que lança não estoura (REC-02, AC 2)
Proof: `node --test --test-name-pattern "REC-02" tests/recomendacoes.test.mjs`

**C3** - Valor ausente, JSON inválido, `versao` 2 e `filmeId` rejeitado são ausência (REC-03, AC 3)
Proof: `node --test --test-name-pattern "REC-03" tests/recomendacoes.test.mjs`

**C4** - Só Novidades, Mais bem avaliados e Filmes em Cartaz gravam; Filmes Populares, Recomendações e o hero não (REC-04, AC 4)
Proof: `node --test --test-name-pattern "REC-04" tests/recomendacoes-ui.test.mjs`

**C5** - Filme guardado pede `GET /api/recomendacoes?filme={id}` (REC-05, AC 5)
Proof: `node --test --test-name-pattern "REC-05" tests/recomendacoes.test.mjs`

**C6** - Enquanto a resposta não chega, não há pôster de recomendação (REC-06, AC 6)
Proof: `node --test --test-name-pattern "REC-06" tests/recomendacoes-ui.test.mjs`

**C7** - Status diferente de 200 não mostra a fileira (REC-07, AC 7)
Proof: `node --test --test-name-pattern "REC-07" tests/recomendacoes.test.mjs`

**C8** - Status 200 com `filmes` vazio não mostra a fileira (REC-08, AC 8)
Proof: `node --test --test-name-pattern "REC-08" tests/recomendacoes.test.mjs`

**C9** - A fileira `Recomendações` vem antes de Novidades, Mais bem avaliados e Filmes em Cartaz (REC-09, AC 9)
Proof: `node --test --test-name-pattern "REC-09" tests/recomendacoes-ui.test.mjs`

**C10** - O pôster de Recomendações abre `/filme/{id}` e não grava a chave (REC-10, AC 10)
Proof: `node --test --test-name-pattern "REC-10" tests/recomendacoes-ui.test.mjs`

**C11** - O evento `storage` da chave relê o filme (REC-11, AC 11)
Proof: `node --test --test-name-pattern "REC-11" tests/recomendacoes.test.mjs`

**C12** - Outra chave de `storage` é ignorada (REC-12, AC 12)
Proof: `node --test --test-name-pattern "REC-12" tests/recomendacoes.test.mjs`

**C13** - Origem `1,2` e candidato `1,1,3` dão parte de gênero `0.25` (REC-13, AC 13)
Proof: `node --test --test-name-pattern "REC-13" tests/recomendacoes.test.mjs`

**C14** - Sem gênero, a parte de gênero é `0` (REC-14, AC 14)
Proof: `node --test --test-name-pattern "REC-14" tests/recomendacoes.test.mjs`

**C15** - `colecaoId` igual e não nulo soma `0.3` (REC-15, AC 15)
Proof: `node --test --test-name-pattern "REC-15" tests/recomendacoes.test.mjs`

**C16** - Algum `colecaoId` nulo soma `0` de coleção (REC-16, AC 16)
Proof: `node --test --test-name-pattern "REC-16" tests/recomendacoes.test.mjs`

**C17** - Elenco cruzado nos 5 primeiros soma `0.15` (REC-17, AC 17)
Proof: `node --test --test-name-pattern "REC-17" tests/recomendacoes.test.mjs`

**C18** - Interseção vazia soma `0` de elenco (REC-18, AC 18)
Proof: `node --test --test-name-pattern "REC-18" tests/recomendacoes.test.mjs`

**C19** - O conjunto fica com 5, na menor ordem e desempate por `pessoaId` (REC-19, AC 19)
Proof: `node --test --test-name-pattern "REC-19" tests/recomendacoes.test.mjs`

**C20** - Soma `0`, ou sem gênero em comum e sem coleção, exclui o candidato (REC-20, AC 20)
Proof: `node --test --test-name-pattern "REC-20" tests/recomendacoes.test.mjs`

**C21** - O id de origem fica de fora (REC-21, AC 21)
Proof: `node --test --test-name-pattern "REC-21" tests/recomendacoes.test.mjs`

**C22** - `posterPath` nulo ou `""` fica de fora (REC-22, AC 22)
Proof: `node --test --test-name-pattern "REC-22" tests/recomendacoes.test.mjs`

**C23** - No máximo 12, na ordem nota, `votos`, `notaMedia`, `id` (REC-23, AC 23)
Proof: `node --test --test-name-pattern "REC-23" tests/recomendacoes.test.mjs`

**C24** - `filme` que não passa em `idDoFilme` responde 404 (REC-24, AC 24)
Proof: `node --test --test-name-pattern "REC-24" tests/recomendacoes.test.mjs`

**C25** - Filme ausente responde 404 (REC-25, AC 25)
Proof: `node --test --test-name-pattern "REC-25" tests/recomendacoes.test.mjs`

**C26** - Filme sem candidato responde 200 e `filmes` vazio (REC-26, AC 26)
Proof: `node --test --test-name-pattern "REC-26" tests/recomendacoes.test.mjs`

**C27** - Cada item traz `id`, `titulo` e `src` em `w500`, no máximo 12 (REC-27, AC 27)
Proof: `node --test --test-name-pattern "REC-27" tests/recomendacoes.test.mjs`

**C28** - Leitura do catálogo que lança responde 500 (REC-28, AC 28)
Proof: `node --test --test-name-pattern "REC-28" tests/recomendacoes.test.mjs`

**C29** - Leitura do `localStorage` que lança esconde a fileira (REC-29, AC 29)
Proof: `node --test --test-name-pattern "REC-29" tests/recomendacoes.test.mjs`

---

## Handoff

**Settled mid-build:** none
**Dispatched:** 2026-11-05 verifier (fresh sub-agent, author != verifier) on the working tree, returned. No screens sub-agent: no criterion cites a capture. Round 2: mutations re-run.
**Walked:** 2026-11-05. Sem filme guardado, a home mostra Novidades, Mais bem avaliados e Filmes em Cartaz e não mostra Recomendações. O primeiro pôster de Novidades, Pinóquio: Maldição de Madeira, abre `/filme/1232569` e grava `{"versao":1,"filmeId":1232569}`. Voltar deixa a fileira Recomendações na frente, com 12 pôsteres, sem o filme clicado. O primeiro deles, Outra Mamãe, abre `/filme/1400837` e a chave continua `1232569`. O título do hero A Odisseia abre `/filme/1368337` e a chave continua `1232569`. Sem login. Banco semeado.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2 -> T3
Phase 3:  T4 -> T5
Phase 4:  T6 -> T7
```

Sete tarefas cabem num lote. A execução fica na janela principal. Nenhum commit.
