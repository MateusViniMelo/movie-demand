# Busca textual Tasks

**Approved**: 2026-10-28 - user: "faça"

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/busca-textual/design.md`
**Status**: Draft
**Mutations**: 3
**Build**: `npm run lint; npm run build`

Commits suspensos: o pedido e o plano desta feature proíbem `git commit`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Amostras: `tests/vitrine.test.mjs`, `tests/fileira-swiper.test.mjs`, `tests/migracao-filmes.test.mjs`, `tests/home-fonte.test.mjs`, `tests/catalogo-seed.test.mjs`. Runner real: `node --test`. Lint: `npm run lint`. Build: `npm run build` (não há script `tsc`).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio da busca | unit | 1:1 com BUS-12, BUS-13, BUS-16, BUS-17, BUS-19, BUS-21 e BUS-22 | `tests/busca.test.mjs` | `node --test tests/busca.test.mjs` |
| Acesso ao Postgres | integration | BUS-14, BUS-15 e BUS-20 contra o banco semeado | `tests/busca-pg.test.mjs` | `node --test tests/busca-pg.test.mjs` |
| Rota e telas | unit | BUS-01 a BUS-11 e BUS-18 no texto-fonte, no padrão dos contratos da home | `tests/busca-ui.test.mjs` | `node --test tests/busca-ui.test.mjs` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de tarefa com teste de contrato ou função pura | `node --test tests/busca.test.mjs tests/busca-ui.test.mjs` |
| Full | Depois da tarefa que lê o Postgres | `node --test tests/busca.test.mjs tests/busca-pg.test.mjs tests/busca-ui.test.mjs` |
| Build | Depois da página | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Seis tarefas, um lote, execução inline. Sem subagentes de implementação.

### Phase 1: Consulta

```
T1 -> T2
```

### Phase 2: Rota

```
T3
```

### Phase 3: Telas

```
T4 -> T5 -> T6
```

---

## Task Breakdown

### Phase 1: Consulta

### T1: Regras puras da busca

**What**: Gravar texto, tsquery, ficha, recorte e o SQL do vetor `portuguese`.
**Where**: `lib/busca.mjs`
**Depends on**: None
**Reuses**: `lib/cartaz.mjs`
**Requirement**: BUS-12, BUS-13, BUS-16, BUS-17, BUS-19, BUS-21, BUS-22

**Done when**:

- [x] `textoDaBusca` corta em 80 e descarta o que não é letra ou número
- [x] `tsqueryDaBusca` põe `:*` só na última palavra
- [x] `fichaDaBusca` escolhe backdrop, pôster ou nada, e omite duração 0 e gênero vazio
- [x] `recorte` usa 5 ou 10, página inválida vira 1, e página alta volta à última
- [x] `vetorSql` cita `portuguese`, `titulo`, `titulo_original` e `sinopse`, e não cita gênero nem duração
- [x] `node --test tests/busca.test.mjs` passa
- [x] Test count: 7 tests pass

**Tests**: unit
**Gate**: quick

---

### T2: Consulta no Postgres

**What**: `buscarFilmes` conta, ordena por `ts_rank` e `id`, e devolve o corte.
**Where**: `lib/busca-db.ts`
**Depends on**: T1
**Reuses**: `lib/prisma.ts` e o SQL de `lib/busca.mjs`
**Requirement**: BUS-14, BUS-15, BUS-20

**Done when**:

- [x] Texto vazio devolve `estado: "vazio"` sem SQL
- [x] `hom` inclui o filme `969681`
- [x] Empate de rank sai com `id` crescente
- [x] Stopword sozinha devolve `estado: "nenhum"`
- [x] `node --test tests/busca-pg.test.mjs` passa
- [x] Test count: 3 tests pass

**Tests**: integration
**Gate**: full

---

### Phase 2: Rota

### T3: Rota GET /api/busca

**What**: A rota lê `q`, `pagina` e `tamanho`, e devolve a ficha ou 500.
**Where**: `app/api/busca/route.ts`
**Depends on**: T2
**Reuses**: `buscarFilmes`
**Requirement**: BUS-03, BUS-04, BUS-22

**Done when**:

- [x] `tamanho` diferente de 5 e de 10 vira 5
- [x] Falha do banco responde status 500 e `estado: "erro"`
- [x] O corpo não inclui `ts_rank` nem tempo
- [x] `node --test tests/busca-ui.test.mjs` passa nos testes da rota
- [x] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

---

### Phase 3: Telas

### T4: Campo e painel

**What**: O campo busca a cada tecla e o botão abre `/busca`.
**Where**: `components/busca.tsx`
**Depends on**: T3
**Reuses**: tokens `stage`, `brand` e `font-display`
**Requirement**: BUS-01, BUS-02, BUS-03, BUS-04, BUS-05, BUS-06, BUS-18

**Done when**:

- [x] Texto não vazio pede `GET /api/busca` com tamanho 5, depois de 200 ms
- [x] Campo vazio fecha o painel
- [x] Os textos `Nenhum filme para esta busca.` e `A busca falhou.` existem
- [x] Enter e `Busca completa` apontam para `/busca?q=<texto>&pagina=1`
- [x] As cinco linhas não têm `href`
- [x] A tela não mostra nota nem tempo
- [x] `node --test tests/busca-ui.test.mjs` passa
- [x] Test count: 7 tests pass

**Tests**: unit
**Gate**: quick

---

### T5: Campo no topo

**What**: O topo mostra o campo entre o nome e o botão de tema.
**Where**: `components/topo.tsx`
**Depends on**: T4
**Reuses**: `components/busca.tsx`
**Requirement**: BUS-01, BUS-11

**Done when**:

- [x] `Topo` renderiza `Busca` no modo `painel` na home
- [x] `Topo` não chama `useSearchParams`
- [x] `node --test tests/busca-ui.test.mjs` passa
- [x] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

---

### T6: Página /busca

**What**: A página lista 10 filmes e troca `pagina`, atrás de `Suspense`.
**Where**: `app/busca/page.tsx`
**Depends on**: T2, T5
**Reuses**: `buscarFilmes` e o `Suspense` de `app/page.tsx`
**Requirement**: BUS-07, BUS-08, BUS-09, BUS-10, BUS-11

**Done when**:

- [x] O filho que lê `searchParams` está dentro de `Suspense`
- [x] A lista usa `mx-auto w-full max-w-6xl` e tamanho 10
- [x] Os controles são `Página anterior` e `Próxima página`
- [x] Sem `q`, o texto é `Digite um filme para buscar.` e não há filme
- [x] `pagina` além do fim redireciona para a última
- [x] `app/page.tsx` continua sem ler `searchParams`
- [x] `npm run lint && node --test && npm run build` passa
- [x] Test count: 5 tests pass

**Tests**: unit
**Gate**: build

---

## Checks

**C1** - Digitar texto no topo mostra no máximo 5 filmes, com banner, título, gênero e duração, sem botão de envio (BUS-01, AC 1)
Proof: `node --test --test-name-pattern "BUS-01" tests/busca-ui.test.mjs`

**C2** - Campo vazio ou só com espaços fecha o painel (BUS-02, AC 2)
Proof: `node --test --test-name-pattern "BUS-02" tests/busca-ui.test.mjs`

**C3** - Nenhum filme mostra o texto `Nenhum filme para esta busca.` (BUS-03, AC 3)
Proof: `node --test --test-name-pattern "BUS-03" tests/busca-ui.test.mjs`

**C4** - Falha do banco mostra o texto `A busca falhou.` (BUS-04, AC 4)
Proof: `node --test --test-name-pattern "BUS-04" tests/busca-ui.test.mjs`

**C5** - Enter ou `Busca completa` abre `/busca?q=<texto>&pagina=1` (BUS-05, AC 5)
Proof: `node --test --test-name-pattern "BUS-05" tests/busca-ui.test.mjs`

**C6** - As cinco linhas do painel não têm `href` para uma ficha (BUS-06, AC 6)
Proof: `node --test --test-name-pattern "BUS-06" tests/busca-ui.test.mjs`

**C7** - `/busca` com `q` lista até 10 filmes na coluna `mx-auto w-full max-w-6xl` (BUS-07, AC 1)
Proof: `node --test --test-name-pattern "BUS-07" tests/busca-ui.test.mjs`

**C8** - `Página anterior` e `Próxima página` mudam `pagina` (BUS-08, AC 2)
Proof: `node --test --test-name-pattern "BUS-08" tests/busca-ui.test.mjs`

**C9** - `pagina` além da última volta para a última página que existe (BUS-09, AC 3)
Proof: `node --test --test-name-pattern "BUS-09" tests/busca.test.mjs`

**C10** - `/busca` sem `q` mostra `Digite um filme para buscar.` e zero filmes (BUS-10, AC 4)
Proof: `node --test --test-name-pattern "BUS-10" tests/busca-ui.test.mjs`

**C11** - A home não lê a query desta busca no servidor (BUS-11, AC 5)
Proof: `node --test --test-name-pattern "BUS-11" tests/busca-ui.test.mjs`

**C12** - O vetor é `to_tsvector('portuguese', ...)` sobre `titulo`, `titulo_original` e `sinopse` (BUS-12, AC 1)
Proof: `node --test --test-name-pattern "BUS-12" tests/busca.test.mjs`

**C13** - Gênero e duração não entram no vetor (BUS-13, AC 2)
Proof: `node --test --test-name-pattern "BUS-13" tests/busca.test.mjs`

**C14** - Empate de relevância ordena pelo `id` crescente (BUS-14, AC 3)
Proof: `node --test --test-name-pattern "BUS-14" tests/busca-pg.test.mjs`

**C15** - `hom` encontra `Homem-Aranha: Um Novo Dia` (BUS-15, AC 4)
Proof: `node --test --test-name-pattern "BUS-15" tests/busca-pg.test.mjs`

**C16** - O banner é o backdrop, o pôster se o backdrop falta, ou nada (BUS-16, AC 5)
Proof: `node --test --test-name-pattern "BUS-16" tests/busca.test.mjs`

**C17** - Duração 0 ou gênero ausente some da linha (BUS-17, AC 6)
Proof: `node --test --test-name-pattern "BUS-17" tests/busca.test.mjs`

**C18** - A tela não mostra `ts_rank` nem o tempo da consulta (BUS-18, AC 7)
Proof: `node --test --test-name-pattern "BUS-18" tests/busca-ui.test.mjs`

**C19** - Texto além de 80 caracteres usa só os 80 primeiros (BUS-19, edge)
Proof: `node --test --test-name-pattern "BUS-19" tests/busca.test.mjs`

**C20** - Stopword sozinha conta como nenhum filme (BUS-20, edge)
Proof: `node --test --test-name-pattern "BUS-20" tests/busca-pg.test.mjs`

**C21** - `pagina` que não é inteiro maior que zero vira 1 (BUS-21, edge)
Proof: `node --test --test-name-pattern "BUS-21" tests/busca.test.mjs`

**C22** - `tamanho` diferente de 5 e de 10 vira 5 (BUS-22, edge)
Proof: `node --test --test-name-pattern "BUS-22" tests/busca.test.mjs`

---

## Handoff

**Settled mid-build:** none
**Dispatched:** none
**Walked:** 2026-10-28. Painel: na home, `hom` mostra 5 fichas (banner, título, gênero, duração) e `Busca completa`; espaços fecham o painel; `zzzzqqq` mostra `Nenhum filme para esta busca.` Página: `/busca?q=hom&pagina=1` lista 8 na coluna central; `/busca?q=ar&pagina=2` fica na página 2 com `Página anterior`; `/busca?q=hom&pagina=9` volta para `pagina=1`; `/busca` sem `q` mostra `Digite um filme para buscar.` e zero filmes. Banco semeado, sem login.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 -> T2
Phase 2:  T3
Phase 3:  T4 -> T5 -> T6
```

Seis tarefas cabem num lote. A execução, quando for aprovada, fica na janela principal. Nenhum commit.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Regras puras da busca | 1 módulo | OK |
| T2: Consulta no Postgres | 1 função | OK |
| T3: Rota GET /api/busca | 1 endpoint | OK |
| T4: Campo e painel | 1 componente | OK |
| T5: Campo no topo | 1 componente | OK |
| T6: Página /busca | 1 página | OK |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | início da fase 1 | OK |
| T2 | T1 | T1 -> T2 | OK |
| T3 | T2 | fase 2, dependência entre fases | OK |
| T4 | T3 | início da fase 3, dependência entre fases | OK |
| T5 | T4 | T4 -> T5 | OK |
| T6 | T2, T5 | T5 -> T6 e T2 em outra fase | OK |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Domínio da busca | unit | unit | OK |
| T2 | Acesso ao Postgres | integration | integration | OK |
| T3 | Rota e telas | unit | unit | OK |
| T4 | Rota e telas | unit | unit | OK |
| T5 | Rota e telas | unit | unit | OK |
| T6 | Rota e telas | unit | unit | OK |
