# Setup Postgres 17 e Prisma

## Problem Statement

O catálogo ainda não tem banco. A próxima entrega precisa de PostgreSQL 17 no ar e de um cliente Prisma apontando para a mesma linha de filme que `lib/filmes.ts` já descreve. A home continua lendo o array local.

## Goals

- [x] `docker compose up -d` sobe um Postgres 17 com o banco `catalogo`
- [x] O Prisma 7 descreve a tabela `filmes` e exporta um único cliente
- [x] A raiz continua importando os filmes de `lib/filmes.ts`

## Out of Scope

| Feature | Reason |
| --- | --- |
| Seed das 10 fichas | A carga do catálogo é outra entrega |
| Trocar a home para o Prisma | O pedido é só o setup |
| Container do Next | O app segue com `npm run dev` no host |
| Busca textual, dicionário `portuguese` e CSV | Dependem da etapa de medição |
| Conta de usuário | Fora do experimento |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Onde o Next roda | No host, via `npm run dev` | O Compose existe para o banco | yes |
| Nome do banco, usuário e senha | `catalogo` / `catalogo` / `catalogo` | O roadmap já chama o banco de `catalogo`. A senha é só local | yes |
| Host na connection string | `localhost:5432` | O Next não está na rede do Compose | yes |
| Carga inicial | Tabela `filmes` vazia, 0 linhas | Seed ficou de fora desta entrega | yes |
| Pasta do client gerado | `generated/prisma`, fora do git | Evita misturar o client com o App Router | yes |
| Papel do pacote `pg` | Driver do `@prisma/adapter-pg`, não a API de consulta | Prisma 7 exige adapter | yes |
| `id` do filme | Inteiro obrigatório, sem autoincremento | Os ids do experimento já vêm no dado | yes |
| Demais dimensões (auth, pagamento, concorrência, TTL, observabilidade) | N/A para este escopo | Não há escrita da aplicação nem usuário nesta entrega | yes |

**Open questions:** none

---

## User Stories

### P1: Subir o Postgres 17 ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero um Postgres 17 local para o Prisma ter onde criar a tabela.

**Why P1**: Sem o banco, a migração não tem destino.

**Acceptance Criteria**:

1. WHEN `docker-compose.yml` é lido THEN o sistema SHALL declarar um único serviço, de nome `db`, com a imagem exatamente `postgres:17`.
2. WHEN `docker-compose.yml` é lido THEN o sistema SHALL publicar a porta do host `5432` na porta `5432` do container.
3. WHEN `docker-compose.yml` é lido THEN o sistema SHALL montar o volume nomeado `catalogo_pg` em `/var/lib/postgresql/data`.
4. WHEN `docker-compose.yml` é lido THEN o sistema SHALL definir `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` como `catalogo`.
5. WHEN `docker-compose.yml` é lido THEN o sistema SHALL usar `restart: unless-stopped` e `shm_size: 128mb`.
6. WHEN `docker-compose.yml` é lido THEN o sistema SHALL checar a saúde com `pg_isready -h localhost -U catalogo -d catalogo`, intervalo `5s`, timeout `5s`, `10` tentativas e `start_period: 30s`.
7. WHEN `.env.example` é lido THEN o sistema SHALL conter a linha `DATABASE_URL=postgresql://catalogo:catalogo@localhost:5432/catalogo`.
8. WHEN `.gitignore` é lido THEN o sistema SHALL ignorar `.env*` e SHALL reincluir `.env.example`.

**Independent Test**: `node --test` nos contratos do Compose e do `.env.example`, sem subir o container.

---

### P1: Modelar a linha de filme no Prisma ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero o modelo `Filme` no Prisma para a tabela nascer com as mesmas colunas de `lib/filmes.ts`.

**Why P1**: O ORM sem esse modelo não serve o experimento.

**Acceptance Criteria**:

1. WHEN `prisma/schema.prisma` é lido THEN o sistema SHALL definir `generator client` com provider `prisma-client` e output `../generated/prisma`.
2. WHEN `prisma/schema.prisma` é lido THEN o sistema SHALL definir `datasource db` com provider `postgresql` e SHALL omitir a URL nesse arquivo.
3. WHEN `prisma.config.ts` é lido THEN o sistema SHALL carregar `dotenv/config` e SHALL passar `env("DATABASE_URL")` em `datasource.url`.
4. WHEN `prisma/schema.prisma` é lido THEN o sistema SHALL definir o model `Filme` mapeado para a tabela `filmes`, com `id` `Int` `@id` sem `autoincrement`, `titulo` `String`, `descricao` `String`, `genero` `String`, `duracaoMin` `Int` mapeado para `duracao_min`, `urlMidia` `String` mapeado para `url_midia`, `origem` do enum `Origem` e `tags` `String[]`.
5. WHEN `prisma/schema.prisma` é lido THEN o enum `Origem` SHALL ter exatamente os valores `real` e `sintetica`.
6. WHEN `lib/prisma.ts` é lido THEN o sistema SHALL exportar um único `prisma` criado com `PrismaPg` e `connectionString: process.env.DATABASE_URL`.
7. WHILE `NODE_ENV` não é `production` o sistema SHALL guardar esse cliente em `globalThis`.
8. WHEN `package.json` é lido THEN o sistema SHALL expor os scripts `db:up` (`docker compose up -d`), `db:down` (`docker compose down`) e SHALL prefixar `build` com `prisma generate`.

**Independent Test**: `node --test` nos contratos do schema, do config e de `lib/prisma.ts`.

---

### P1: Criar a tabela vazia ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero a migração inicial aplicada para a tabela `filmes` existir vazia.

**Why P1**: O schema sem migração não cria a tabela.

**Acceptance Criteria**:

1. WHEN a migração inicial está aplicada THEN o banco `catalogo` SHALL ter a tabela `filmes` com as colunas `id`, `titulo`, `descricao`, `genero`, `duracao_min`, `url_midia`, `origem` e `tags`, todas `NOT NULL`.
2. WHEN a migração inicial está aplicada THEN `id` e `duracao_min` SHALL ser `integer`, `tags` SHALL ser `ARRAY` e as demais colunas de texto SHALL ser `text`.
3. WHEN a migração inicial está aplicada THEN a tabela `filmes` SHALL conter `0` linhas.
4. IF o daemon do Docker não aceita conexão THEN o sistema SHALL manter Compose, schema e cliente no repositório e SHALL registrar o bloqueio em vez de inventar uma migração aplicada.

**Independent Test**: Com o container saudável, `node --test tests/migracao-filmes.test.mjs` consulta `information_schema` e a contagem de linhas.

---

### P1: Não mudar a fonte da home ⭐ MVP

**User Story**: Como quem apresenta o catálogo, quero a raiz igual para o setup de banco não trocar a vitrine.

**Why P1**: A listagem local já está verificada.

**Acceptance Criteria**:

1. WHEN `app/page.tsx` é lido THEN o sistema SHALL importar `filmes` de `@/lib/filmes`.
2. WHEN `app/page.tsx` é lido THEN o sistema SHALL omitir qualquer import de `@/lib/prisma` ou `generated/prisma`.

**Independent Test**: `node --test` lê `app/page.tsx` e confere o import.

---

### P1: Documentar o arranque local ⭐ MVP

**User Story**: Como quem clona o repositório, quero o README dizendo como subir o banco e aplicar a migração.

**Why P1**: Sem o comando, o Compose fica invisível.

**Acceptance Criteria**:

1. WHEN `README.md` é lido THEN o sistema SHALL citar `npm run db:up` e `npx prisma migrate dev`.
2. WHEN `.specs/project/PROJECT.md` é lido THEN o sistema SHALL citar PostgreSQL 17 e Prisma 7 como stack do banco.
3. WHEN `.specs/project/STATE.md` é lido THEN o sistema SHALL registrar que a consulta passa pelo Prisma e que `pg` fica só como driver.

**Independent Test**: `node --test` lê os três arquivos.

---

## Edge Cases

- IF a imagem for `postgres:latest`, `postgres:18` ou `postgres:17-alpine` THEN o contrato SHALL falhar, porque a tag exigida é exatamente `postgres:17`.
- IF `id` ganhar `@default(autoincrement())` THEN o contrato do schema SHALL falhar.
- IF existir um model de tag separado THEN o contrato SHALL falhar, porque `tags` é `String[]`.
- IF a migração inserir fichas THEN a contagem SHALL deixar de ser `0`.
- IF `.env.example` continuar ignorado pelo `.gitignore` THEN o contrato do gitignore SHALL falhar.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DB-01 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-02 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-03 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-04 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-05 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-06 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-07 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-08 | P1: Subir o Postgres 17 | Execute | Verified |
| DB-09 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-10 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-11 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-12 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-13 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-14 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-15 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-16 | P1: Modelar a linha de filme no Prisma | Execute | Verified |
| DB-17 | P1: Criar a tabela vazia | Execute | Verified |
| DB-18 | P1: Criar a tabela vazia | Execute | Verified |
| DB-19 | P1: Criar a tabela vazia | Execute | Verified |
| DB-20 | P1: Criar a tabela vazia | Execute | Verified |
| DB-21 | P1: Não mudar a fonte da home | Execute | Verified |
| DB-22 | P1: Não mudar a fonte da home | Execute | Verified |
| DB-23 | P1: Documentar o arranque local | Execute | Verified |
| DB-24 | P1: Documentar o arranque local | Execute | Verified |
| DB-25 | P1: Documentar o arranque local | Execute | Verified |

**ID format:** `DB-[NUMBER]`

**Coverage:** 25 total, 25 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] O contrato do Compose exige a imagem `postgres:17`, o banco `catalogo` e o volume em `/var/lib/postgresql/data`
- [x] O schema Prisma espelha as colunas de `Filme` e o cliente é um singleton com `PrismaPg`
- [x] `app/page.tsx` continua importando `@/lib/filmes`
