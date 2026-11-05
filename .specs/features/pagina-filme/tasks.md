# Página do filme Tasks

**Approved**: 2026-11-05 - user: "Implement the plan as specified"

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline no plano. Sem `design.md`.
**Status**: Approved
**Mutations**: 3
**Build**: `npm run lint; node --test; npm run build`

Commits suspensos: o plano desta feature proíbe `git commit`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Amostras: `tests/vitrine.test.mjs`, `tests/home-fonte.test.mjs`, `tests/busca-ui.test.mjs`, `tests/busca-pg.test.mjs`. Runner real: `node --test`. Lint: `npm run lint`. Build: `npm run build`. Não há script `tsc`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Ficha do filme | unit | 1:1 com PAG-04, PAG-05, PAG-06 e PAG-08, mais o filme semeado `969681` | `tests/filme.test.mjs` | `node --test tests/filme.test.mjs` |
| Leitura por id | unit | O `findUnique` pede só `id`, `titulo`, `posterPath` e `backdropPath`, no padrão de VIT-01 | `tests/filme.test.mjs` | `node --test tests/filme.test.mjs` |
| Rota e links | unit | PAG-01 a PAG-03, PAG-07, PAG-09 a PAG-13 no texto-fonte | `tests/filme-ui.test.mjs` | `node --test tests/filme-ui.test.mjs` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de tarefa com função pura ou contrato de tela | `node --test tests/filme.test.mjs tests/filme-ui.test.mjs` |
| Full | Depois da tarefa que lê o filme semeado | `node --test tests/filme.test.mjs tests/filme-ui.test.mjs` |
| Build | Depois da última tarefa | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Seis tarefas, um lote, execução inline. Sem subagentes de implementação.

### Phase 1: Ficha

```
T1
```

### Phase 2: Página

```
T2 -> T3
```

### Phase 3: Links

```
T4 -> T5 -> T6
```

---

## Task Breakdown

### Phase 1: Ficha

### T1: Ficha pura do still

**What**: `fichaDoFilme`, `idDoFilme` e `caminhoDoFilme`.
**Where**: `lib/filme.mjs`
**Depends on**: None
**Reuses**: `urlDoPoster` de `lib/cartaz.mjs`
**Requirement**: PAG-04, PAG-05, PAG-06, PAG-08

**Done when**:

- [x] Backdrop não vazio vira `https://image.tmdb.org/t/p/w1280` mais o caminho
- [x] Backdrop nulo ou `""` cai no pôster `w1280`
- [x] Os dois caminhos nulos ou `""` deixam `fundo` nulo e preservam o título
- [x] `idDoFilme` aceita `/^[1-9]\d*$/` inteiro seguro e rejeita `0`, `01`, `1.5`, `-3` e texto
- [x] `caminhoDoFilme(155)` é `/filme/155`
- [x] O filme semeado `969681` devolve `Homem-Aranha: Um Novo Dia` e o backdrop `w1280` da linha
- [x] `node --test tests/filme.test.mjs` passa

**Tests**: unit
**Gate**: full

---

### Phase 2: Página

### T2: Leitura por id

**What**: `carregarFilme` lê uma linha pelo id.
**Where**: `lib/filme-db.ts`
**Depends on**: T1
**Reuses**: `lib/prisma.ts`
**Requirement**: PAG-04, PAG-09

**Done when**:

- [x] `findUnique` filtra por `id` e seleciona só `id`, `titulo`, `posterPath` e `backdropPath`
- [x] `node --test tests/filme.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### T3: Rota /filme/[id]

**What**: Still, `h1` com o título, não encontrado e o título do documento.
**Where**: `app/filme/[id]/page.tsx`
**Depends on**: T2
**Reuses**: `fichaDoFilme`, `idDoFilme`, `carregarFilme`, `Topo`
**Requirement**: PAG-04, PAG-06, PAG-07, PAG-08, PAG-09, PAG-10, PAG-11, PAG-12

**Done when**:

- [x] Id inválido ou filme ausente chama `notFound()`
- [x] O `h1` visível é `ficha.titulo` e a imagem só entra com `ficha.fundo`
- [x] A página não escreve sinopse, gênero, duração, elenco, nota, trailer nem player
- [x] `generateMetadata` devolve `title: ficha.titulo`
- [x] A página renderiza `Topo`, não renderiza `Voltar`, e o fallback diz `Carregando o filme…`
- [x] `node --test tests/filme-ui.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### Phase 3: Links

### T4: Pôster abre o filme

**What**: O pôster inteiro aponta para `/filme/{id}`.
**Where**: `components/poster.tsx`
**Depends on**: T1
**Reuses**: `caminhoDoFilme`
**Requirement**: PAG-01

**Done when**:

- [x] O `href` é `caminhoDoFilme(filme.id)` e o `alt` continua o título
- [x] `node --test tests/filme-ui.test.mjs tests/home-fonte.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### T5: Título do hero abre o filme

**What**: Só o título do slide vira link.
**Where**: `components/hero.tsx`
**Depends on**: T4
**Reuses**: `caminhoDoFilme`
**Requirement**: PAG-02, PAG-13

**Done when**:

- [x] O `h1` contém `href={caminhoDoFilme(filme.id)}`
- [x] `Filme anterior`, `Próximo filme` e `Pausar a troca automática` continuam `button`
- [x] `node --test tests/filme-ui.test.mjs tests/home-fonte.test.mjs` passa

**Tests**: unit
**Gate**: quick

---

### T6: Linha da busca abre o filme

**What**: Cada linha do painel e de `/busca` aponta para `/filme/{id}`.
**Where**: `components/busca.tsx`
**Depends on**: T5
**Reuses**: `caminhoDoFilme` e `LinhaBusca`
**Requirement**: PAG-03

**Done when**:

- [x] `LinhaBusca` usa `href={caminhoDoFilme(filme.id)}`
- [x] O contrato antigo que proibia href de ficha passa a exigir esse href
- [x] `npm run lint && node --test && npm run build` passa

**Tests**: unit
**Gate**: build

---

## Checks

**C1** - O pôster da fileira abre `/filme/{id}` (PAG-01, AC 1)
Proof: `node --test --test-name-pattern "PAG-01" tests/filme-ui.test.mjs`

**C2** - O título do slide atual do hero abre `/filme/{id}` (PAG-02, AC 2)
Proof: `node --test --test-name-pattern "PAG-02" tests/filme-ui.test.mjs`

**C3** - A linha da busca no painel e em `/busca` abre `/filme/{id}` (PAG-03, AC 3)
Proof: `node --test --test-name-pattern "PAG-03" tests/filme-ui.test.mjs`

**C4** - Backdrop não vazio vira still `w1280` e o título da linha (PAG-04, AC 4)
Proof: `node --test --test-name-pattern "PAG-04" tests/filme.test.mjs`

**C5** - Sem backdrop, o still é o pôster `w1280` (PAG-05, AC 5)
Proof: `node --test --test-name-pattern "PAG-05" tests/filme.test.mjs`

**C6** - Sem backdrop e sem pôster, `fundo` é nulo e o título permanece (PAG-06, AC 6)
Proof: `node --test --test-name-pattern "PAG-06" tests/filme.test.mjs`

**C7** - A página do filme não mostra sinopse, gênero, duração, elenco, nota, trailer nem player (PAG-07, AC 7)
Proof: `node --test --test-name-pattern "PAG-07" tests/filme-ui.test.mjs`

**C8** - `0`, `01`, `1.5`, `-3`, texto e `2147483648` não são id; `2147483647` é (PAG-08, AC 8)
Proof: `node --test --test-name-pattern "PAG-08" tests/filme.test.mjs`

**C9** - Filme ausente chama `notFound()` (PAG-09, AC 9)
Proof: `node --test --test-name-pattern "PAG-09" tests/filme-ui.test.mjs`

**C10** - O segmento do título do documento é `ficha.titulo` (PAG-10, AC 10)
Proof: `node --test --test-name-pattern "PAG-10" tests/filme-ui.test.mjs`

**C11** - A página renderiza `Topo` e não renderiza `Voltar` (PAG-11, AC 11)
Proof: `node --test --test-name-pattern "PAG-11" tests/filme-ui.test.mjs`

**C12** - Enquanto carrega, a página mostra `Carregando o filme…` (PAG-12, AC 12)
Proof: `node --test --test-name-pattern "PAG-12" tests/filme-ui.test.mjs`

**C13** - Os controles do hero continuam botões (PAG-13, AC 13)
Proof: `node --test --test-name-pattern "PAG-13" tests/filme-ui.test.mjs`

---

## Handoff

**Settled mid-build:** none
**Dispatched:** 2026-11-05 verifier (fresh sub-agent, author != verifier) on the working tree, returned. No screens sub-agent: no criterion cites a capture. Round 2: mutations killed.
**Walked:** 2026-11-05. Home: o título do hero `A Odisseia` abre `/filme/1368337` com `h1` `A Odisseia`, documento `A Odisseia — Cineverso` e still `w1280`, sem sinopse. Pôster de Novidades abre `/filme/1232569` com `h1` `Pinóquio: Maldição de Madeira`. Painel `hom` abre `/filme/969681` com `h1` `Homem-Aranha: Um Novo Dia`. `/filme/abc` e `/filme/999999999` respondem 404. Sem login. Banco semeado.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1
Phase 2:  T2 -> T3
Phase 3:  T4 -> T5 -> T6
```

Seis tarefas cabem num lote. A execução fica na janela principal. Nenhum commit.
