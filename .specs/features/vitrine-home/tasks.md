# Vitrine da home Tasks

**Design**: `.specs/features/vitrine-home/design.md`
**Status**: In progress

---

## Test Coverage Matrix

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Montagem da vitrine | unit | VIT-01, VIT-02, VIT-03, VIT-05 e pôster nulo | `tests/vitrine.test.mjs` | `node --test` |
| Listas semeadas | integration | VIT-04, ids da posição 1 | `tests/vitrine.test.mjs` | `node --test` |
| Home | unit | VIT-06 a VIT-12 | `tests/home-fonte.test.mjs`, `tests/fileira-swiper.test.mjs` | `node --test` |
| Docs | unit | VIT-13, VIT-14 | `tests/docs-contrato.test.mjs` | `node --test` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de tarefa com teste de contrato | `node --test` |
| Full | Depois de tarefa que lê o banco | `node --test` |
| Build | Última tarefa | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Três tarefas, um lote, execução inline.

```
T1 -> T2 -> T3
```

---

## Task Breakdown

### T1: Montar a vitrine

**What**: Gravar `urlDoPoster`, `montarVitrine` e `carregarVitrine`, com o teste dos tamanhos e dos ids da posição 1.
**Where**: `lib/cartaz.mjs`
**Depends on**: None
**Reuses**: `withClient` não existe aqui; a conexão segue o padrão de `tests/catalogo-seed.test.mjs`
**Requirement**: VIT-01, VIT-02, VIT-03, VIT-04, VIT-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `montarVitrine` omite `poster_path` nulo e ordena por `posicao`
- [x] O destaque usa `w780` só no primeiro de `upcoming`
- [x] As quatro fileiras usam `w500` na ordem da spec
- [x] A posição 1 do banco semeado bate com `1232569`, `969681`, `1560520` e `1058424`
- [x] Gate: `node --test`

**Tests**: unit
**Gate**: full

**Commit**: done

---

### T2: Trocar a home

**What**: A raiz passa a renderizar o destaque e as quatro fileiras, só com pôster, e libera o host do TMDB.
**Where**: `app/page.tsx`
**Depends on**: T1
**Reuses**: `Fileira` e o Swiper já presentes
**Requirement**: VIT-06, VIT-07, VIT-08, VIT-09, VIT-10, VIT-11, VIT-12

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A página mostra `Novidades` com `primeiroMaior` e as quatro fileiras
- [ ] O primeiro slide do destaque usa `w-[14rem]` e `sm:w-[22rem]`
- [ ] O pôster não tem gênero, duração nem sinopse, e o `alt` é o título
- [ ] O fallback é `Carregando o catálogo.` e o vazio é `Nenhuma ficha neste catálogo.`
- [ ] `next.config.ts` permite `image.tmdb.org` em `/t/p/**`
- [ ] A página não importa `@/lib/filmes`
- [ ] Gate: `node --test`

**Tests**: unit
**Gate**: quick

**Commit**: pending

---

### T3: Documentar a fonte

**What**: O README deixa de dizer que a home lê `lib/filmes.ts`. O estado ganha AD-007.
**Where**: `README.md`
**Depends on**: T2
**Reuses**: o formato AD-006
**Requirement**: VIT-13, VIT-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] O README cita `Filmes Populares` e não contém `A home continua lendo`
- [ ] `STATE.md` contém `AD-007` e a home nas listas do PostgreSQL
- [ ] Gate: `npm run lint && node --test && npm run build`

**Tests**: unit
**Gate**: build

**Commit**: pending

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | início | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T2 | T2 -> T3 | Match |
