# Setup Redis 8 Tasks

**Approved**: 2026-11-04 - user: "Implement the plan as specified, it is attached for your reference."

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: skipped. Sem decisão de arquitetura além do contrato em `spec.md`.
**Status**: Done
**Mutations**: 3
**Build**: `npm run lint; node --test; npm run build`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied. Amostras: `tests/compose-contrato.test.mjs`, `tests/env-contrato.test.mjs`, `tests/cliente-prisma.test.mjs`, `tests/docs-contrato.test.mjs`, `tests/migracao-filmes.test.mjs`. Runner real: `node --test`. Lint: `npm run lint`. Build: `npm run build`. Não há script `tsc`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Compose | unit | RD-01 a RD-07 e a imagem, a porta, o volume, o restart, a ausência de senha e o healthcheck | `tests/compose-contrato.test.mjs`, `tests/redis-compose.test.mjs` | `node --test` |
| Env | unit | A linha exata de `REDIS_URL` no exemplo e, se existir, no `.env` | `tests/redis-env.test.mjs` | `node --test` |
| Cliente | unit | Export único, `createClient`, `globalThis`, sem `connect(`, pacote `redis`, `db:up` e nenhum import na UI | `tests/redis-cliente.test.mjs` | `node --test` |
| Docs | unit | README, PROJECT.md e AD-009 | `tests/redis-docs.test.mjs` | `node --test` |
| Redis ao vivo | integration | `PONG` real, bloqueio ausente e falha fechada sem `PONG` fictício | `tests/redis-ping.test.mjs` | `node --test tests/redis-ping.test.mjs` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de tarefa com teste de contrato | `node --test` |
| Full | Depois da tarefa com `PING` | `node --test` |
| Build | Última tarefa da fase | `npm run lint && node --test && npm run build` |

---

## Execution Plan

Cinco tarefas, um lote, execução inline.

### Phase 1: Redis local

```
T1 -> T2 -> T3 -> T4 -> T5
```

---

## Task Breakdown

### Phase 1: Redis local

### T1: Declarar o serviço redis:8

**What**: Acrescentar o serviço `redis` ao Compose e travar RD-01 a RD-07. A lista de serviços do teste `DB-01` passa a `db` e `redis`. Os demais asserts do Postgres ficam.
**Where**: `docker-compose.yml`
**Depends on**: None
**Reuses**: `docker-compose.yml` e `tests/compose-contrato.test.mjs`
**Requirement**: RD-01, RD-02, RD-03, RD-04, RD-05, RD-06, RD-07

**Done when**:

- [x] Os serviços são `db` e `redis`, nessa ordem, e a imagem do Redis é `redis:8`
- [x] A porta é `6379:6379`, o volume é `catalogo_redis` em `/data` e o restart é `unless-stopped`
- [x] Não há `command`, `requirepass` nem `REDIS_PASSWORD`
- [x] O healthcheck é `redis-cli ping` com intervalo `5s`, timeout `5s`, `10` tentativas e `start_period: 5s`
- [x] Gate: `node --test`
- [x] Test count: 126 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

---

### T2: Publicar REDIS_URL

**What**: Gravar a linha exata em `.env.example`. Se `.env` existir, acrescentar a mesma linha.
**Where**: `.env.example`
**Depends on**: T1
**Reuses**: a URL já fixada na spec
**Requirement**: RD-08, RD-09

**Done when**:

- [x] `.env.example` contém `REDIS_URL=redis://localhost:6379`
- [x] Se `.env` existe, contém a mesma linha
- [x] Gate: `node --test`
- [x] Test count: 128 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

---

### T3: Exportar o cliente único

**What**: Instalar o pacote `redis` e gravar `lib/redis.ts` sem conectar no carregamento. `db:up` permanece `docker compose up -d`. `app/` e `components/` não importam o cliente.
**Where**: `lib/redis.ts`
**Depends on**: T2
**Reuses**: `lib/prisma.ts`
**Requirement**: RD-10, RD-11, RD-12, RD-13, RD-14, RD-15

**Done when**:

- [x] O módulo exporta só `redis`, criado com `createClient({ url: process.env.REDIS_URL })`
- [x] Fora de `production` o cliente fica em `globalThis`
- [x] O fonte não contém `connect(`
- [x] `dependencies` inclui `redis` e `db:up` continua `docker compose up -d`
- [x] `app/` e `components/` não importam `@/lib/redis` nem o pacote `redis`
- [x] Gate: `node --test`
- [x] Test count: 134 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

---

### T4: Documentar o arranque

**What**: Citar Redis 8 e `REDIS_URL` no README, Redis 8 no PROJECT.md e gravar `AD-009` no STATE.md com a frase `nenhuma tela lê o Redis`.
**Where**: `README.md`
**Depends on**: T3
**Reuses**: o parágrafo de ambiente do README
**Requirement**: RD-16, RD-17, RD-18

**Done when**:

- [x] README cita `Redis 8` e `REDIS_URL`
- [x] PROJECT.md cita `Redis 8`
- [x] STATE.md registra `AD-009` com `nenhuma tela lê o Redis`
- [x] Gate: `node --test`
- [x] Test count: 137 testes passam

**Tests**: unit
**Gate**: quick
**Status**: Complete

---

### T5: Provar o PING

**What**: Subir o serviço e exigir `PONG` de `redis://localhost:6379`. Com `PONG`, o arquivo de bloqueio fica ausente. O teste não captura erro para devolver `PONG`.
**Where**: `tests/redis-ping.test.mjs`
**Depends on**: T4
**Reuses**: o cliente `redis` instalado em T3
**Requirement**: RD-19, RD-20, RD-21

**Done when**:

- [x] `PING` devolve `PONG`
- [x] `.specs/features/setup-redis/bloqueio-docker.md` não existe
- [x] O teste de `PING` chama `ping()` e não tem `catch` que invente `PONG`
- [x] Gate: `npm run lint && node --test && npm run build`
- [x] Test count: 140 testes passam

**Tests**: integration
**Gate**: build
**Status**: Complete

---

## Checks

**C1** - O Compose lista os serviços `db` e `redis`, nessa ordem (RD-01, AC 1)
Proof: `node --test --test-name-pattern "RD-01" tests/compose-contrato.test.mjs`

**C2** - A imagem do serviço `redis` é exatamente `redis:8` (RD-02, AC 2)
Proof: `node --test --test-name-pattern "RD-02" tests/redis-compose.test.mjs`

**C3** - A porta publicada é `6379:6379` (RD-03, AC 3)
Proof: `node --test --test-name-pattern "RD-03" tests/redis-compose.test.mjs`

**C4** - O volume `catalogo_redis` monta em `/data` (RD-04, AC 4)
Proof: `node --test --test-name-pattern "RD-04" tests/redis-compose.test.mjs`

**C5** - O serviço `redis` usa `restart: unless-stopped` (RD-05, AC 5)
Proof: `node --test --test-name-pattern "RD-05" tests/redis-compose.test.mjs`

**C6** - O serviço `redis` omite `command`, `requirepass` e `REDIS_PASSWORD` (RD-06, AC 6)
Proof: `node --test --test-name-pattern "RD-06" tests/redis-compose.test.mjs`

**C7** - O healthcheck é `redis-cli ping`, com `5s`, `5s`, `10` e `start_period: 5s` (RD-07, AC 7)
Proof: `node --test --test-name-pattern "RD-07" tests/redis-compose.test.mjs`

**C8** - `.env.example` contém `REDIS_URL=redis://localhost:6379` (RD-08, AC 1)
Proof: `node --test --test-name-pattern "RD-08" tests/redis-env.test.mjs`

**C9** - O `.env` local, quando existe, contém `REDIS_URL=redis://localhost:6379` (RD-09, AC 2)
Proof: `node --test --test-name-pattern "RD-09" tests/redis-env.test.mjs`

**C10** - `lib/redis.ts` exporta só `redis`, criado com `createClient({ url: process.env.REDIS_URL })` (RD-10, AC 3)
Proof: `node --test --test-name-pattern "RD-10" tests/redis-cliente.test.mjs`

**C11** - Fora de `production` o cliente fica em `globalThis` (RD-11, AC 4)
Proof: `node --test --test-name-pattern "RD-11" tests/redis-cliente.test.mjs`

**C12** - `lib/redis.ts` omite a chamada `connect(` (RD-12, AC 5)
Proof: `node --test --test-name-pattern "RD-12" tests/redis-cliente.test.mjs`

**C13** - `dependencies` inclui o pacote `redis` (RD-13, AC 6)
Proof: `node --test --test-name-pattern "RD-13" tests/redis-cliente.test.mjs`

**C14** - `db:up` é `docker compose up -d` (RD-14, AC 7)
Proof: `node --test --test-name-pattern "RD-14" tests/redis-cliente.test.mjs`

**C15** - `app/` e `components/` não importam `@/lib/redis` nem o pacote `redis` (RD-15, AC 8)
Proof: `node --test --test-name-pattern "RD-15" tests/redis-cliente.test.mjs`

**C16** - O README cita `Redis 8` e `REDIS_URL` (RD-16, AC 1)
Proof: `node --test --test-name-pattern "RD-16" tests/redis-docs.test.mjs`

**C17** - PROJECT.md cita `Redis 8` (RD-17, AC 2)
Proof: `node --test --test-name-pattern "RD-17" tests/redis-docs.test.mjs`

**C18** - STATE.md registra `AD-009` com a frase `nenhuma tela lê o Redis` (RD-18, AC 3)
Proof: `node --test --test-name-pattern "RD-18" tests/redis-docs.test.mjs`

**C19** - `PING` em `redis://localhost:6379` devolve `PONG` (RD-19, AC 1)
Proof: `node --test --test-name-pattern "RD-19" tests/redis-ping.test.mjs`

**C20** - Com `PONG`, `bloqueio-docker.md` está ausente (RD-20, AC 2)
Proof: `node --test --test-name-pattern "RD-20" tests/redis-ping.test.mjs`

**C21** - O teste de `PING` chama `ping()` e não captura erro para inventar `PONG` (RD-21, AC 3)
Proof: `node --test --test-name-pattern "RD-21" tests/redis-ping.test.mjs`

---

## Handoff

**Settled mid-build:** none
**Dispatched:** Verifier, round 1, returned. Sem subagente de telas: nenhum critério cita captura.
**Walked:** sem tela. Nenhum critério cita captura.

---

## Phase Execution Map

```
Phase 1

Phase 1:  T1 -> T2 -> T3 -> T4 -> T5
```

Cinco tarefas cabem num lote. A execução fica na janela principal.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Declarar o serviço redis:8 | 1 serviço no Compose | OK |
| T2: Publicar REDIS_URL | 1 exemplo de env | OK |
| T3: Exportar o cliente único | 1 módulo | OK |
| T4: Documentar o arranque | README, com PROJECT.md e STATE.md no mesmo contrato | OK |
| T5: Provar o PING | 1 teste de integração | OK |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | início | OK |
| T2 | T1 | T1 -> T2 | OK |
| T3 | T2 | T2 -> T3 | OK |
| T4 | T3 | T3 -> T4 | OK |
| T5 | T4 | T4 -> T5 | OK |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Compose | unit | unit | OK |
| T2 | Env | unit | unit | OK |
| T3 | Cliente | unit | unit | OK |
| T4 | Docs | unit | unit | OK |
| T5 | Redis ao vivo | integration | integration | OK |
