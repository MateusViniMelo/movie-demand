# SEO do catálogo Tasks

**Approved**: 2026-10-29 - user: "Implement the plan as specified, it is attached for your reference."

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline, sem `design.md`
**Status**: In Progress
**Mutations**: 3
**Build**: `npm run lint; node --test; npm run build`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Amostras: `tests/busca.test.mjs`, `tests/busca-ui.test.mjs`, `tests/vitrine.test.mjs`. Runner real: `node --test`. Lint: `npm run lint`. Build: `npm run build` (não há script `tsc`).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio SEO | unit | 1:1 com SEO-01 a SEO-10 e os dois edge cases | `tests/seo.test.mjs` | `node --test tests/seo.test.mjs` |
| Rotas | unit | Home, busca, robots, sitemap e API chamam o domínio | `tests/seo.test.mjs` | `node --test tests/seo.test.mjs` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de tarefa com teste de função pura | `node --test tests/seo.test.mjs` |
| Full | Depois de tarefa com teste de rota | `node --test tests/seo.test.mjs` |
| Build | Depois da última tarefa | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Três tarefas, um lote, execução inline. Sem subagentes de implementação.

### Phase 1: Fundação

```
T1 -> T2 -> T3
```

---

## Task Breakdown

### Phase 1: Fundação

### T1: Contrato do SEO

**What**: Gravar origem, metadados, JSON-LD, robots, sitemap e o cabeçalho da API.
**Where**: `lib/seo.mjs`
**Depends on**: None
**Reuses**: o padrão de função pura de `lib/busca.mjs`
**Requirement**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10

**Done when**:

- [x] `metadadosDaHome` devolve título `Cineverso`, a descrição da spec, canônica absoluta, Open Graph sem imagem e Twitter `summary`
- [x] `jsonLdDoSite` devolve `WebSite` sem `potentialAction`
- [x] `metadadosDaBusca` devolve segmento `Busca`, descrição da spec e `noindex, nofollow`, sem depender da query
- [x] `cabecalhoDaApi` devolve `X-Robots-Tag: noindex`
- [x] `urlsDoSitemap` tem uma URL, a home, e não cita `/busca` nem `/api/busca`
- [x] `regrasDeRobots` permite `/`, bloqueia `/api/` e aponta o sitemap absoluto
- [x] `origemDoSite` usa `http://localhost:3000` quando a env falta ou não é `http`/`https` absoluto
- [x] `idiomaDoDocumento` é `pt-BR`
- [x] `node --test tests/seo.test.mjs` passa
- [x] Test count: 10 tests pass

**Tests**: unit
**Gate**: quick

---

### T2: Home indexável

**What**: Ligar o layout e a home ao contrato: `metadataBase`, título padrão, Open Graph, canônica e JSON-LD. O `h1` do herói não muda.
**Where**: `app/layout.tsx`
**Depends on**: T1
**Reuses**: `lib/seo.mjs` e o guia `json-ld.md` do Next
**Requirement**: SEO-01, SEO-02, SEO-03, SEO-04

**Done when**:

- [x] O layout usa `metadataBase`, o template `%s — Cineverso` e não define canônica
- [x] A home publica a canônica absoluta e o script `application/ld+json` do `WebSite`
- [x] `components/hero.tsx` permanece sem esta tarefa
- [x] `node --test tests/seo.test.mjs` passa
- [x] Test count: 10 tests pass

**Tests**: unit
**Gate**: quick

---

### T3: Fora do índice

**What**: Metadata de `/busca`, `app/robots.ts`, `app/sitemap.ts`, cabeçalho da API, `NEXT_PUBLIC_SITE_URL` no exemplo e uma frase no README.
**Where**: `app/robots.ts`
**Depends on**: T2
**Reuses**: `lib/seo.mjs` e os arquivos `robots.md` e `sitemap.md` do Next
**Requirement**: SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10

**Done when**:

- [ ] `/busca` exporta `metadata` estático com `noindex, nofollow` e não lê `searchParams` nesse export
- [ ] `robots.ts` e `sitemap.ts` devolvem o contrato
- [ ] Os dois `Response.json` da API mandam `X-Robots-Tag: noindex`
- [ ] `.env.example` e o README citam `NEXT_PUBLIC_SITE_URL` e o README mantém `npm run db:up`, `npx prisma migrate dev`, `npm run db:seed`, `data/tmdb` e `Filmes Populares`
- [ ] `npm run lint && node --test && npm run build` passa
- [ ] Test count: 10 tests pass

**Tests**: unit
**Gate**: build

---

## Checks

**Build**: `npm run lint; node --test; npm run build`

**C1** - A home publica o título `Cineverso` e a descrição `Catálogo de filmes sob demanda, com populares, novidades, bem avaliados e em cartaz.` (SEO-01, AC 1)
Proof: `node --test --test-name-pattern "SEO-01" tests/seo.test.mjs`

**C2** - A home publica a canônica absoluta e Open Graph `website` / `pt_BR` / `Cineverso`, sem imagem (SEO-02, AC 2)
Proof: `node --test --test-name-pattern "SEO-02" tests/seo.test.mjs`

**C3** - A home inclui JSON-LD `WebSite` com `name` `Cineverso`, `inLanguage` `pt-BR`, URL com barra final e a descrição da home (SEO-03, AC 3)
Proof: `node --test --test-name-pattern "SEO-03" tests/seo.test.mjs`

**C4** - O documento mantém `lang` `pt-BR` (SEO-04, AC 4)
Proof: `node --test --test-name-pattern "SEO-04" tests/seo.test.mjs`

**C5** - `/busca` envia `noindex, nofollow`, título `Busca — Cineverso` e a descrição `Resultados da busca no catálogo Cineverso.` (SEO-05, AC 1)
Proof: `node --test --test-name-pattern "SEO-05" tests/seo.test.mjs`

**C6** - `GET /api/busca` inclui `X-Robots-Tag: noindex` no sucesso e no erro 500 (SEO-06, AC 2)
Proof: `node --test --test-name-pattern "SEO-06" tests/seo.test.mjs`

**C7** - O sitemap não contém `/busca` nem `/api/busca` (SEO-07, AC 3)
Proof: `node --test --test-name-pattern "SEO-07" tests/seo.test.mjs`

**C8** - `robots.txt` tem `User-agent: *`, `Allow: /`, `Disallow: /api/` e a URL absoluta do sitemap (SEO-08, AC 1)
Proof: `node --test --test-name-pattern "SEO-08" tests/seo.test.mjs`

**C9** - O sitemap tem uma única URL, a home absoluta (SEO-09, AC 2)
Proof: `node --test --test-name-pattern "SEO-09" tests/seo.test.mjs`

**C10** - Sem `NEXT_PUBLIC_SITE_URL` absoluta `http` ou `https`, a origem é `http://localhost:3000` (SEO-10, AC 3)
Proof: `node --test --test-name-pattern "SEO-10" tests/seo.test.mjs`

---

## Handoff

**Settled mid-build:** none
**Dispatched:** none
**Walked:** none

---

## Phase Execution Map

```
Phase 1

Phase 1:  T1 -> T2 -> T3
```

Três tarefas cabem num lote. A execução fica na janela principal.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Contrato do SEO | 1 módulo | OK |
| T2: Home indexável | layout e a página que o usa | OK |
| T3: Fora do índice | robots, sitemap, busca e API no mesmo contrato | OK |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | início | OK |
| T2 | T1 | T1 -> T2 | OK |
| T3 | T2 | T2 -> T3 | OK |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Domínio SEO | unit | unit | OK |
| T2 | Rotas | unit | unit | OK |
| T3 | Rotas | unit | unit | OK |
