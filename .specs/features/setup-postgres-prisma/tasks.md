# Setup Postgres 17 e Prisma Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: skipped. Sem decisão de arquitetura além do contrato em `spec.md`.
**Status**: Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. O plano aprovado fixa `node --test` como runner. Não havia testes no repositório. `AGENTS.md` não define cobertura.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Compose | unit | Cada AC de imagem, porta, volume, credencial, healthcheck e a regressão da home | `tests/compose-contrato.test.mjs`, `tests/home-fonte.test.mjs` | `node --test` |
| Env | unit | `DATABASE_URL` exata e a exceção do `.gitignore` | `tests/env-contrato.test.mjs` | `node --test` |
| Prisma schema | unit | Model, enum, maps e config, 1:1 com os ACs | `tests/schema-contrato.test.mjs` | `node --test` |
| Prisma client | unit | Adapter, `DATABASE_URL` e cache em `globalThis` | `tests/cliente-prisma.test.mjs` | `node --test` |
| Migration | integration | Colunas `NOT NULL`, tipos e `0` linhas; ou o bloqueio do daemon | `tests/migracao-filmes.test.mjs` | `node --test` |
| Docs | unit | README, PROJECT.md e STATE.md citam o contrato | `tests/docs-contrato.test.mjs` | `node --test` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Depois de tarefa com teste de contrato | `node --test` |
| Full | Depois da tarefa de migração | `node --test` |
| Build | Última tarefa da fase | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Fases em sequência. Seis tarefas, um lote, execução inline.

### Phase 1: Banco e Prisma

```
T1 -> T2 -> T3 -> T4 -> T5
```

### Phase 2: Documentação

```
T6
```

---

## Task Breakdown

### Phase 1: Banco e Prisma

### T1: Criar o serviço Postgres 17

**What**: Gravar `docker-compose.yml` com o serviço `db` e os testes de contrato do Compose e da home.
**Where**: `docker-compose.yml`
**Depends on**: None
**Reuses**: colunas de `lib/filmes.ts` só como referência, sem importar o array
**Requirement**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-21, DB-22

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A imagem é exatamente `postgres:17`, a porta é `5432:5432`, o volume é `catalogo_pg` em `/var/lib/postgresql/data`
- [x] Usuário, senha e banco são `catalogo`; restart, shm e healthcheck batem com a spec
- [x] `app/page.tsx` importa `@/lib/filmes` e não importa o Prisma
- [x] Gate: `node --test`
- [x] Test count: 8 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

**Commit**: `feat(db): add postgres 17 compose service`

---

### T2: Publicar o exemplo da connection string

**What**: Gravar `.env.example` e a exceção `!.env.example` no `.gitignore`.
**Where**: `.env.example`
**Depends on**: T1
**Reuses**: credenciais já fixadas em `docker-compose.yml`
**Requirement**: DB-07, DB-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `.env.example` contém `DATABASE_URL=postgresql://catalogo:catalogo@localhost:5432/catalogo`
- [x] `.gitignore` ignora `.env*` e reinclui `.env.example`
- [x] Gate: `node --test`
- [x] Test count: 10 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

**Commit**: `feat(db): add local database url example`

---

### T3: Declarar o model Filme

**What**: Instalar Prisma 7, gravar `prisma/schema.prisma` e `prisma.config.ts`, e apontar os scripts de banco no `package.json`.
**Where**: `prisma/schema.prisma`
**Depends on**: T2
**Reuses**: campos de `lib/filmes.ts`
**Requirement**: DB-09, DB-10, DB-11, DB-12, DB-13, DB-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Generator, datasource sem URL, model `Filme`, enum `Origem` e maps batem com a spec
- [x] `prisma.config.ts` usa `dotenv/config` e `env("DATABASE_URL")`
- [x] Scripts `db:up`, `db:down` e o prefixo `prisma generate` no `build` existem
- [x] `npx prisma validate` sai 0
- [x] Gate: `node --test`
- [x] Test count: 16 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

**Commit**: `feat(db): add filme prisma schema`

---

### T4: Exportar o cliente único

**What**: Gravar o singleton em `lib/prisma.ts` e ignorar `generated/prisma` no ESLint.
**Where**: `lib/prisma.ts`
**Depends on**: T3
**Reuses**: `PrismaPg` como no guia do Prisma 7 para Next.js
**Requirement**: DB-14, DB-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `lib/prisma.ts` exporta `prisma` com `PrismaPg` e `process.env.DATABASE_URL`
- [x] Fora de `production` o cliente fica em `globalThis`
- [x] Gate: `node --test`
- [x] Test count: 18 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

**Commit**: `feat(db): add prisma client singleton`

---

### T5: Aplicar a migração inicial

**What**: Com o Docker no ar, gerar e aplicar a migração `init`. Sem daemon, registrar o bloqueio e não simular tabela aplicada.
**Where**: `tests/migracao-filmes.test.mjs`
**Depends on**: T4
**Reuses**: `DATABASE_URL` do `.env` local, fora do git
**Requirement**: DB-17, DB-18, DB-19, DB-20

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Com o banco saudável, `filmes` tem as 8 colunas `NOT NULL`, os tipos da spec e `0` linhas
- [x] Sem daemon, o bloqueio fica registrado e a suíte não finge que a tabela existe
- [x] Gate: `npm run lint && node --test && npm run build`
- [x] Test count: 22 testes passam

**Tests**: integration
**Gate**: build
**Status**: Complete

**Commit**: `feat(db): add initial filmes migration`

---

### Phase 2: Documentação

### T6: Documentar o arranque

**What**: Atualizar README, a linha de stack do PROJECT.md e a decisão no STATE.md.
**Where**: `README.md`
**Depends on**: T5
**Reuses**: comandos `db:up` e `prisma migrate dev`
**Requirement**: DB-23, DB-24, DB-25

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] README cita `npm run db:up` e `npx prisma migrate dev`
- [x] PROJECT.md cita PostgreSQL 17 e Prisma 7
- [x] STATE.md registra Prisma como consulta e `pg` como driver
- [x] Gate: `npm run lint && node --test && npm run build`
- [x] Test count: 25 testes passam

**Tests**: unit
**Gate**: build
**Status**: Complete

**Commit**: `docs(db): document local postgres setup`

---

## Phase Execution Map

```
Phase 1 -> Phase 2

Phase 1:  T1 -> T2 -> T3 -> T4 -> T5
Phase 2:  T6
```

Seis tarefas. Um lote. Execução inline, sem sub-agente.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Criar o serviço Postgres 17 | 1 arquivo de Compose | Granular |
| T2: Publicar o exemplo da connection string | 1 arquivo de exemplo | Granular |
| T3: Declarar o model Filme | schema coeso com config e scripts | Granular |
| T4: Exportar o cliente único | 1 módulo | Granular |
| T5: Aplicar a migração inicial | 1 verificação de banco | Granular |
| T6: Documentar o arranque | docs do mesmo contrato | Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | início da cadeia | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T2 | T2 -> T3 | Match |
| T4 | T3 | T3 -> T4 | Match |
| T5 | T4 | T4 -> T5 | Match |
| T6 | T5 | fase anterior, sem seta intrafase | Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1: Criar o serviço Postgres 17 | Compose | unit | unit | OK |
| T2: Publicar o exemplo da connection string | Env | unit | unit | OK |
| T3: Declarar o model Filme | Prisma schema | unit | unit | OK |
| T4: Exportar o cliente único | Prisma client | unit | unit | OK |
| T5: Aplicar a migração inicial | Migration | integration | integration | OK |
| T6: Documentar o arranque | Docs | unit | unit | OK |
