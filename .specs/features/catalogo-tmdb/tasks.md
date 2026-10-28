# Catálogo TMDB Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/catalogo-tmdb/design.md`
**Status**: Done

Commits suspensos: o pedido e o plano desta feature proíbem `git commit`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Amostras: `tests/schema-contrato.test.mjs`, `tests/migracao-filmes.test.mjs`, `tests/docs-contrato.test.mjs`, `tests/home-fonte.test.mjs`, `tests/cliente-prisma.test.mjs`. Runner real: `node --test`. Lint: `npm run lint`. Build: `npm run build`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Prisma schema | unit | 1:1 com CAT-01 a CAT-10 | `tests/schema-contrato.test.mjs` | `node --test` |
| Migration | integration | Colunas, chaves, ausência de `Origem` e SQL sem `INSERT` | `tests/migracao-filmes.test.mjs` | `node --test` |
| Seed | integration | Contagens, amostra, segunda execução e as três falhas sem escrita | `tests/catalogo-seed.test.mjs` | `node --test` |
| Config do seed | unit | `migrations.seed` e o script `db:seed` | `tests/schema-contrato.test.mjs` | `node --test` |
| Home | unit | CAT-35 e CAT-36, já cobertos | `tests/home-fonte.test.mjs` | `node --test` |
| Docs | unit | README e AD-006 | `tests/docs-contrato.test.mjs` | `node --test` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Depois de tarefa com teste de contrato | `node --test` |
| Full | Depois de tarefa que escreve ou lê o banco | `node --test` |
| Build | Última tarefa da fase | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Seis tarefas, um lote, execução inline. Sem subagentes de implementação.

### Phase 1: Schema, migração e seed

```
T1 -> T2 -> T3 -> T4
```

### Phase 2: Documentação

```
T5 -> T6
```

---

## Task Breakdown

### Phase 1: Schema, migração e seed

### T1: Declarar os models do catálogo

**What**: Trocar o model `Filme` e os testes de contrato do schema para CAT-01 a CAT-10.
**Where**: `prisma/schema.prisma`
**Depends on**: None
**Reuses**: generator e datasource já presentes
**Requirement**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06, CAT-07, CAT-08, CAT-09, CAT-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O schema omite `Origem`, `tags`, `urlMidia` e `origem`
- [x] Os oito models batem com a spec
- [x] Gate: `node --test`
- [x] Test count: a suíte não perde DB-09, DB-10, DB-11 nem DB-16

**Tests**: unit
**Gate**: quick

**Commit**: skipped

---

### T2: Aplicar a migração do catálogo

**What**: Gerar a migração que derruba `filmes` e `Origem`, e atualizar o teste de `information_schema`.
**Where**: `tests/migracao-filmes.test.mjs`
**Depends on**: T1
**Reuses**: `withClient` já existente nesse arquivo
**Requirement**: CAT-11, CAT-12, CAT-13, CAT-14, CAT-15, CAT-16, CAT-17, CAT-18, CAT-19, CAT-20

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O banco tem as colunas, as chaves e não tem o tipo `Origem`
- [x] O SQL novo não contém `INSERT`
- [x] Gate: `node --test`
- [x] Test count: DB-20 permanece

**Tests**: integration
**Gate**: full

**Commit**: skipped

---

### T3: Persistir `data/tmdb`

**What**: Gravar `prisma/seed.mjs` com `carregarCatalogo` e `semear`, e o teste de integração do recorte.
**Where**: `prisma/seed.mjs`
**Depends on**: T2
**Reuses**: `PrismaPg` como em `lib/prisma.ts`
**Requirement**: CAT-21, CAT-22, CAT-23, CAT-24, CAT-25, CAT-26, CAT-27, CAT-28, CAT-29, CAT-30, CAT-31, CAT-32

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] As contagens e a amostra da spec batem
- [x] A segunda execução não duplica
- [x] Lista curta, elenco ausente e gênero `99999` lançam erro e deixam as contagens
- [x] Gate: `node --test`

**Tests**: integration
**Gate**: full

**Commit**: skipped

---

### T4: Ligar o comando do seed

**What**: Apontar `migrations.seed` e o script `db:seed`.
**Where**: `prisma.config.ts`
**Depends on**: T3
**Reuses**: `defineConfig` já existente
**Requirement**: CAT-33, CAT-34

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `migrations.seed` é `node prisma/seed.mjs`
- [x] `package.json` tem `db:seed` igual a `prisma db seed`
- [x] Gate: `node --test`

**Tests**: unit
**Gate**: quick

**Commit**: skipped

---

### Phase 2: Documentação

### T5: Documentar o comando no README

**What**: Citar `npm run db:seed` e `data/tmdb` no README e no teste de docs.
**Where**: `README.md`
**Depends on**: T4
**Reuses**: a seção Banco local
**Requirement**: CAT-37

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] O README cita `npm run db:seed` e `data/tmdb`
- [x] A frase de tabela vazia sai do README
- [x] Gate: `node --test`

**Tests**: unit
**Gate**: quick

**Commit**: skipped

---

### T6: Registrar AD-006

**What**: Gravar a decisão que substitui as colunas do experimento e mantém a home local.
**Where**: `.specs/project/STATE.md`
**Depends on**: T5
**Reuses**: o formato AD-005
**Requirement**: CAT-38, CAT-35, CAT-36

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `STATE.md` contém `AD-006`, a substituição das colunas e `lib/filmes.ts`
- [x] `tests/home-fonte.test.mjs` continua verde
- [x] Gate: `npm run lint && node --test && npm run build`

**Tests**: unit
**Gate**: build

**Commit**: skipped

---

## Phase Execution Map

```
Phase 1 -> Phase 2

Phase 1:  T1 -> T2 -> T3 -> T4
Phase 2:  T5 -> T6
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Declarar os models do catálogo | 1 schema | ✅ Granular |
| T2: Aplicar a migração do catálogo | 1 teste de migração mais o SQL gerado | ✅ Granular |
| T3: Persistir data/tmdb | 1 módulo de seed | ✅ Granular |
| T4: Ligar o comando do seed | 1 config | ✅ Granular |
| T5: Documentar o comando no README | 1 documento | ✅ Granular |
| T6: Registrar AD-006 | 1 documento | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | início da Phase 1 | ✅ Match |
| T2 | T1 | T1 -> T2 | ✅ Match |
| T3 | T2 | T2 -> T3 | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T4 | T5 começa a Phase 2; T4 fica na Phase 1 | ✅ Match |
| T6 | T5 | T5 -> T6 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1: Declarar os models do catálogo | Prisma schema | unit | unit | ✅ OK |
| T2: Aplicar a migração do catálogo | Migration | integration | integration | ✅ OK |
| T3: Persistir data/tmdb | Seed | integration | integration | ✅ OK |
| T4: Ligar o comando do seed | Config do seed | unit | unit | ✅ OK |
| T5: Documentar o comando no README | Docs | unit | unit | ✅ OK |
| T6: Registrar AD-006 | Docs | unit | unit | ✅ OK |
