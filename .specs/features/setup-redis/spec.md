# Setup Redis 8

**Approved**: 2026-11-04 - user: "Implement the plan as specified, it is attached for your reference."

## Problem Statement

O Compose só sobe o Postgres. A próxima peça de infraestrutura precisa de um Redis local e de um cliente apontando para ele. A vitrine e a busca continuam lendo o PostgreSQL.

## Goals

- [x] `docker compose up -d` sobe o Redis 8 junto do Postgres 17
- [x] `lib/redis.ts` exporta um único cliente com `REDIS_URL`
- [x] Nenhuma tela, busca ou cache do Next passa a ler o Redis

## Out of Scope

| Feature | Reason |
| --- | --- |
| Cache da vitrine, da busca ou de `cacheComponents` | O pedido é só o setup |
| `cacheHandler` no Next | O cache do processo continua o atual |
| Senha, ACL, fila e sessão | Não há usuário nem job nesta entrega |
| Redis na Vercel | O serviço é local, como o Postgres do Compose |
| Escrita de chave, TTL e métrica | Nenhuma tela usa o cliente ainda |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Corte desta entrega | Serviço, URL e cliente. Nenhuma tela lê o Redis | O usuário escolheu só infraestrutura | y |
| Imagem | Exatamente `redis:8` | Major atual, no mesmo corte de `postgres:17`. Rejeita `latest`, `7` e `alpine` | y |
| Senha | Nenhuma. URL `redis://localhost:6379` | Setup local, sem `requirepass` | y |
| Onde o Next roda | No host, via `npm run dev` | O Compose existe para o banco e o Redis | y |
| Cliente | Pacote `redis`, `createClient({ url: process.env.REDIS_URL })`, sem `connect()` ao carregar | O singleton segue `lib/prisma.ts` e não abre socket no import | y |
| Persistência | Volume `catalogo_redis` em `/data`, sem `command` | O padrão da imagem grava o RDB. Esta entrega não escreve chave | y |
| `db:up` | Continua `docker compose up -d` | O mesmo comando sobe os dois serviços | y |
| Demais dimensões (auth, TTL, retry, métrica, concorrência de escrita) | N/A para este escopo | Não há escrita da aplicação nem usuário nesta entrega | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Subir o Redis 8 ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero um Redis 8 no Compose para o cliente ter onde conectar.

**Why P1**: Sem o serviço, a URL não tem destino.

**Acceptance Criteria**:

1. WHEN `docker-compose.yml` é lido THEN o sistema SHALL listar os serviços exatamente `db` e `redis`, nessa ordem.
2. WHEN o serviço `redis` é lido THEN o sistema SHALL declarar a imagem exatamente `redis:8`.
3. WHEN o serviço `redis` é lido THEN o sistema SHALL publicar a porta do host `6379` na porta `6379` do container.
4. WHEN `docker-compose.yml` é lido THEN o sistema SHALL montar o volume nomeado `catalogo_redis` em `/data`.
5. WHEN o serviço `redis` é lido THEN o sistema SHALL usar `restart: unless-stopped`.
6. WHEN o serviço `redis` é lido THEN o sistema SHALL omitir `command`, `requirepass` e `REDIS_PASSWORD`.
7. WHEN o serviço `redis` é lido THEN o sistema SHALL checar a saúde com `["CMD", "redis-cli", "ping"]`, intervalo `5s`, timeout `5s`, `10` tentativas e `start_period: 5s`.

**Independent Test**: `node --test` nos contratos do Compose, sem subir o container.

---

### P1: Publicar a URL e o cliente ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero `REDIS_URL` e um cliente único para a próxima entrega importar o mesmo Redis.

**Why P1**: O serviço sem cliente fica invisível para o app.

**Acceptance Criteria**:

1. WHEN `.env.example` é lido THEN o sistema SHALL conter a linha `REDIS_URL=redis://localhost:6379`.
2. WHERE um arquivo `.env` existe na raiz o sistema SHALL conter a linha `REDIS_URL=redis://localhost:6379` nesse arquivo.
3. WHEN `lib/redis.ts` é lido THEN o sistema SHALL exportar um único `redis` criado com `createClient({ url: process.env.REDIS_URL })`.
4. WHILE `NODE_ENV` não é `production` o sistema SHALL guardar esse cliente em `globalThis`.
5. WHEN `lib/redis.ts` é lido THEN o sistema SHALL omitir a chamada `connect(`.
6. WHEN `package.json` é lido THEN `dependencies` SHALL incluir o pacote `redis`.
7. WHEN `package.json` é lido THEN `db:up` SHALL ser `docker compose up -d`.
8. WHEN os arquivos de `app/` e `components/` são lidos THEN o sistema SHALL omitir import de `@/lib/redis` e do pacote `redis`.

**Independent Test**: `node --test` lê `.env.example`, `lib/redis.ts`, `package.json`, `app/` e `components/`.

---

### P1: Documentar o arranque local ⭐ MVP

**User Story**: Como quem clona o repositório, quero o README dizendo que o Redis 8 sobe com o banco.

**Why P1**: Sem o texto, o serviço fica invisível.

**Acceptance Criteria**:

1. WHEN `README.md` é lido THEN o sistema SHALL citar `Redis 8` e `REDIS_URL`.
2. WHEN `.specs/project/PROJECT.md` é lido THEN o sistema SHALL citar `Redis 8`.
3. WHEN `.specs/project/STATE.md` é lido THEN o sistema SHALL registrar `AD-009` com a frase `nenhuma tela lê o Redis`.

**Independent Test**: `node --test` lê os três arquivos.

---

### P1: Responder PING ⭐ MVP

**User Story**: Como quem sobe o ambiente, quero um `PONG` do Redis local para saber que o container aceita conexão.

**Why P1**: O arquivo do Compose sem resposta não prova que o serviço subiu.

**Acceptance Criteria**:

1. WHEN o Redis em `redis://localhost:6379` aceita conexão THEN `PING` SHALL devolver `PONG`.
2. WHEN `PING` devolve `PONG` THEN o arquivo `.specs/features/setup-redis/bloqueio-docker.md` SHALL estar ausente.
3. IF o daemon do Docker recusar conexão THEN o sistema SHALL registrar o bloqueio em `.specs/features/setup-redis/bloqueio-docker.md` e SHALL não gravar um `PONG` fictício.

**Independent Test**: Com o container saudável, `node --test tests/redis-ping.test.mjs` recebe `PONG`.

---

## Edge Cases

- IF a imagem for `redis:latest`, `redis:7` ou `redis:8-alpine` THEN o contrato SHALL falhar, porque a tag exigida é exatamente `redis:8`.
- IF o serviço `redis` ganhar `command` ou `requirepass` THEN o contrato SHALL falhar.
- IF `lib/redis.ts` chamar `connect(` THEN o contrato SHALL falhar.
- IF `app/` ou `components/` importar `@/lib/redis` ou o pacote `redis` THEN o contrato SHALL falhar.
- IF o teste de `PING` inventar a string `PONG` sem o servidor THEN o critério do daemon SHALL deixar de valer: o bloqueio é o registro, não um sucesso falso.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| RD-01 | P1: Subir o Redis 8 | Execute | Verified |
| RD-02 | P1: Subir o Redis 8 | Execute | Verified |
| RD-03 | P1: Subir o Redis 8 | Execute | Verified |
| RD-04 | P1: Subir o Redis 8 | Execute | Verified |
| RD-05 | P1: Subir o Redis 8 | Execute | Verified |
| RD-06 | P1: Subir o Redis 8 | Execute | Verified |
| RD-07 | P1: Subir o Redis 8 | Execute | Verified |
| RD-08 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-09 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-10 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-11 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-12 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-13 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-14 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-15 | P1: Publicar a URL e o cliente | Execute | Verified |
| RD-16 | P1: Documentar o arranque local | Execute | Verified |
| RD-17 | P1: Documentar o arranque local | Execute | Verified |
| RD-18 | P1: Documentar o arranque local | Execute | Verified |
| RD-19 | P1: Responder PING | Execute | Verified |
| RD-20 | P1: Responder PING | Execute | Verified |
| RD-21 | P1: Responder PING | Execute | Verified |

**ID format:** `RD-[NUMBER]`

**Coverage:** 21 total, 21 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] O contrato do Compose exige a imagem `redis:8`, a porta `6379` e o volume `catalogo_redis` em `/data`
- [x] `.env.example` e `lib/redis.ts` apontam para `REDIS_URL`, sem `connect()` no carregamento
- [x] Com o container saudável, `PING` devolve `PONG` e nenhuma tela importa o cliente
