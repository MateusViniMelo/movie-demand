# Setup Postgres Prisma Validation

**Result**: PASS

**Date**: 2026-10-27
**Spec**: `.specs/features/setup-postgres-prisma/spec.md`
**Diff range**: worktree não commitado contra `09fc0c1` (feature inteira untracked ou modificada; `git diff 09fc0c1` sozinho não mostra os arquivos novos)
**Verifier**: subagente independente (autor ≠ verificador). Releitura integral da spec, dos testes e do código. Este relatório substitui o de 2026-10-21 (FAIL em DB-14). O mutante daquele relatório agora morre.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | `docker-compose.yml` e testes de Compose e home presentes, todos verdes |
| T2 | ✅ Done | `.env.example` e `!.env.example` depois de `.env*` em `.gitignore:34-35` do worktree |
| T3 | ✅ Done | `prisma/schema.prisma`, `prisma.config.ts` e scripts de `package.json` conferem |
| T4 | ✅ Done | `lib/prisma.ts` e `generated/prisma/**` no ESLint (`eslint.config.mjs:15`) |
| T5 | ✅ Done | Migrações `20261021154528_init` e `20261021154630_tags_not_null`. `prisma migrate status`: "Database schema is up to date!". `migrate diff` banco vs schema: "No difference detected." |
| T6 | ✅ Done | README, PROJECT.md e STATE.md atualizados |

Nenhuma tarefa bloqueada ou parcial. Todas as seis estão `Complete` em `tasks.md`.

---

## Spec-Anchored Acceptance Criteria

### P1: Subir o Postgres 17

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1 Compose lido: um único serviço `db` com `postgres:17` | serviços == `["db"]`; imagem exata `postgres:17` | `tests/compose-contrato.test.mjs:10` - `assert.deepEqual(names, ["db"])`; `:11` - `assert.match(services, /^    image: postgres:17\s*$/m)` (âncora `$` rejeita `17-alpine`, `latest`, `18`) | ✅ PASS |
| AC2 porta `5432` do host na `5432` do container | `"5432:5432"` | `tests/compose-contrato.test.mjs:15` - `assert.match(services, /^      - "5432:5432"\s*$/m)` | ✅ PASS |
| AC3 volume nomeado `catalogo_pg` em `/var/lib/postgresql/data` | mapeamento + declaração de volume nomeado | `tests/compose-contrato.test.mjs:19` - `assert.match(services, /^      - catalogo_pg:\/var\/lib\/postgresql\/data\s*$/m)`; `:20` - `assert.match(compose, /^volumes:\n  catalogo_pg:\s*$/m)` | ✅ PASS |
| AC4 `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` = `catalogo` | três variáveis `catalogo` | `tests/compose-contrato.test.mjs:24-26` - `assert.match(services, /^      POSTGRES_USER: catalogo\s*$/m)` e as duas equivalentes | ✅ PASS |
| AC5 `restart: unless-stopped` e `shm_size: 128mb` | os dois valores exatos | `tests/compose-contrato.test.mjs:30` - `assert.match(services, /^    restart: unless-stopped\s*$/m)`; `:31` - `assert.match(services, /^    shm_size: 128mb\s*$/m)` | ✅ PASS |
| AC6 healthcheck `pg_isready -h localhost -U catalogo -d catalogo`, 5s, 5s, 10, 30s | comando e quatro parâmetros exatos | `tests/compose-contrato.test.mjs:35-38` - `assert.match(services, /^      test: \["CMD-SHELL", "pg_isready -h localhost -U catalogo -d catalogo"\]\s*$/m)`; `:39` `interval: 5s`; `:40` `timeout: 5s`; `:41` `retries: 10`; `:42` `start_period: 30s` | ✅ PASS |
| AC7 `.env.example` contém `DATABASE_URL=postgresql://catalogo:catalogo@localhost:5432/catalogo` | linha exata | `tests/env-contrato.test.mjs:9-12` - `assert.match(example, /^DATABASE_URL=postgresql:\/\/catalogo:catalogo@localhost:5432\/catalogo\s*$/m)` | ✅ PASS |
| AC8 `.gitignore` ignora `.env*` e reinclui `.env.example` | `.env*` antes de `!.env.example` | `tests/env-contrato.test.mjs:18` - `assert.ok(ignoreIndex >= 0)`; `:19` - `assert.ok(unignoreIndex > ignoreIndex)` | ✅ PASS |

### P1: Modelar a linha de filme no Prisma

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1 `generator client`, provider `prisma-client`, output `../generated/prisma` | os dois valores no bloco `generator` | `tests/schema-contrato.test.mjs:12` - `assert.match(generator, /provider\s*=\s*"prisma-client"/)`; `:13` - `assert.match(generator, /output\s*=\s*"\.\.\/generated\/prisma"/)` | ✅ PASS |
| AC2 `datasource db` `postgresql`, sem URL | provider presente, `url` ausente | `tests/schema-contrato.test.mjs:19` - `assert.match(datasource, /provider\s*=\s*"postgresql"/)`; `:20` - `assert.equal(datasource.includes("url"), false)` | ✅ PASS |
| AC3 `prisma.config.ts` carrega `dotenv/config` e passa `env("DATABASE_URL")` em `datasource.url` | import e `url: env("DATABASE_URL")` dentro de `datasource` | `tests/schema-contrato.test.mjs:24` - `assert.match(config, /import "dotenv\/config"/)`; `:25` - `assert.match(config, /datasource:\s*\{[^}]*url:\s*env\("DATABASE_URL"\)/s)` | ✅ PASS |
| AC4 model `Filme` → `filmes`; `id Int @id` sem autoincrement; campos `String`; `duracaoMin`/`urlMidia` com `@map`; `origem Origem`; `tags String[]` | cada campo obrigatório com tipo e map exatos | `tests/schema-contrato.test.mjs:30` `@@map\("filmes"\)`; `:31` `assert.match(model, /id\s+Int(?!\?)\s+@id\b/)`; `:32` `assert.equal(model.includes("autoincrement"), false)`; `:33-35` `titulo`/`descricao`/`genero` `String(?!\?)`; `:36` `duracaoMin\s+Int(?!\?)\s+@map\("duracao_min"\)`; `:37` `urlMidia\s+String(?!\?)\s+@map\("url_midia"\)`; `:38` `origem\s+Origem(?!\?)`; `:39` `tags\s+String\[\](?!\?)`; `:40` `assert.equal(/model Tag \{/.test(schema), false)` | ✅ PASS |
| AC5 enum `Origem` exatamente `real` e `sintetica` | lista ordenada de 2 valores | `tests/schema-contrato.test.mjs:46` - `assert.deepEqual(values, ["real", "sintetica"])` | ✅ PASS |
| AC6 `lib/prisma.ts` exporta um único `prisma` criado com `PrismaPg` e `connectionString: process.env.DATABASE_URL` | um export; `PrismaPg` com a URL; cliente construído com o adapter | `tests/cliente-prisma.test.mjs:9` - `assert.deepEqual(exports, ["prisma"])`; `:10` - `assert.match(source, /new PrismaPg\(\{\s*connectionString: process\.env\.DATABASE_URL,?\s*\}\)/s)`; `:11` - `assert.match(source, /new PrismaClient\(\{\s*adapter\s*,?\s*\}\)/)` | ✅ PASS |
| AC7 WHILE `NODE_ENV` ≠ `production` guarda em `globalThis` | `globalThis`, condição `!== "production"` e atribuição | `tests/cliente-prisma.test.mjs:15` - `assert.match(source, /globalThis/)`; `:16` - `assert.match(source, /process\.env\.NODE_ENV !== "production"/)`; `:17` - `assert.match(source, /globalForPrisma\.prisma = prisma/)` | ✅ PASS (contrato de texto; a spec define o AC como leitura do arquivo) |
| AC8 `package.json`: `db:up`, `db:down`, `build` prefixado com `prisma generate` | strings exatas | `tests/schema-contrato.test.mjs:50` - `assert.equal(pkg.scripts["db:up"], "docker compose up -d")`; `:51` - `assert.equal(pkg.scripts["db:down"], "docker compose down")`; `:52` - `assert.equal(pkg.scripts.build, "prisma generate && next build")` | ✅ PASS |

### P1: Criar a tabela vazia

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1 `filmes` com as 8 colunas, todas `NOT NULL` | 8 pares coluna/`is_nullable` `NO`, em ordem | `tests/migracao-filmes.test.mjs:34-46` - `assert.deepEqual(rows.rows.map((row) => [row.column_name, row.is_nullable]), [["id","NO"],["titulo","NO"],["descricao","NO"],["genero","NO"],["duracao_min","NO"],["url_midia","NO"],["origem","NO"],["tags","NO"]])` | ✅ PASS |
| AC2 `id` e `duracao_min` `integer`, `tags` `ARRAY`, demais texto `text` | tipos de `information_schema` | `tests/migracao-filmes.test.mjs:59` - `assert.equal(byName.id.data_type, "integer")`; `:60` `duracao_min` `"integer"`; `:61` - `assert.equal(byName.tags.data_type, "ARRAY")`; `:63` - `assert.equal(byName[name].data_type, "text")` para `titulo`, `descricao`, `genero`, `url_midia` | ✅ PASS |
| AC3 `filmes` com `0` linhas | contagem `0` | `tests/migracao-filmes.test.mjs:70` - `assert.equal(rows.rows[0].total, 0)` | ✅ PASS |
| AC4 IF daemon não aceita conexão THEN registrar bloqueio, sem inventar migração | com daemon no ar, nenhum arquivo de bloqueio e a conexão funciona | `tests/migracao-filmes.test.mjs:74` - `await withClient((client) => client.query("SELECT 1"))`; `:75` - `assert.equal(existsSync(blocker), false)` | ✅ PASS (ramo do daemon fora do ar não exercitado: o daemon está saudável. O teste prova o ramo inverso, e o banco real confirmou a tabela) |

### P1: Não mudar a fonte da home

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1 `app/page.tsx` importa `filmes` de `@/lib/filmes` | import nomeado de `filmes` | `tests/home-fonte.test.mjs:8` - `assert.match(page, /import \{[^}]*\bfilmes\b[^}]*\} from "@\/lib\/filmes"/)` | ✅ PASS |
| AC2 `app/page.tsx` sem import de `@/lib/prisma` ou `generated/prisma` | ausência das duas strings | `tests/home-fonte.test.mjs:12` - `assert.equal(page.includes("@/lib/prisma"), false)`; `:13` - `assert.equal(page.includes("generated/prisma"), false)` | ✅ PASS |

### P1: Documentar o arranque local

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1 README cita `npm run db:up` e `npx prisma migrate dev` | as duas strings | `tests/docs-contrato.test.mjs:10` - `assert.equal(readme.includes("npm run db:up"), true)`; `:11` - `assert.equal(readme.includes("npx prisma migrate dev"), true)` | ✅ PASS |
| AC2 PROJECT.md cita PostgreSQL 17 e Prisma 7 | as duas strings | `tests/docs-contrato.test.mjs:15` - `assert.equal(project.includes("PostgreSQL 17"), true)`; `:16` - `assert.equal(project.includes("Prisma 7"), true)` | ✅ PASS |
| AC3 STATE.md registra consulta via Prisma e `pg` só como driver | as duas frases | `tests/docs-contrato.test.mjs:20` - `assert.match(state, /A consulta da aplicação passa pelo Prisma/)`; `:21` - `assert.match(state, /O pacote \`pg\` fica só como driver/)` | ✅ PASS |

**Status**: ✅ 25/25 ACs cobertos com `file:line` e asserção que mira o desfecho da spec. 0 lacunas de precisão.

---

## Discrimination Sensor

Baseline: `git status --porcelain` gravado antes de qualquer trabalho (inclui `.claude/`, `.specs/LESSONS.md`, `.specs/lessons.json` e `package-lock.json`, preexistentes). Scratch em `/tmp/sensor.*`: cópia da árvore (código, testes, `.env`, specs) sem `.git`, `.next` e `generated`, com `node_modules` por symlink. Uma cópia nova por mutação (sem acúmulo). Sanidade: cópia sem mutação deu 25 passam, 0 falham. Sem `git stash`, sem `git worktree`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `lib/prisma.ts:10` | `return new PrismaClient({ adapter })` → `return new PrismaClient()` | ✅ Killed (`DB-14` falhou, 24 passam, 1 falha; assert em `tests/cliente-prisma.test.mjs:11`) |
| 2 | `.gitignore:34-35` | Ordem invertida: `!.env.example` antes de `.env*` (a exceção deixa de valer) | ✅ Killed (`DB-08` falhou, assert em `tests/env-contrato.test.mjs:19`) |
| 3 | `prisma/schema.prisma:20` | Campo obrigatório `duracaoMin Int` → `duracaoMin Int?` | ✅ Killed (`DB-12` falhou, assert em `tests/schema-contrato.test.mjs:36`) |

**Sensor depth**: lightweight (setup de infraestrutura, sem pagamento, auth ou integridade de dados da aplicação)
**Result**: 3/3 killed - PASS ✅

Isolamento: scratch removido (`/tmp/sensor.*` inexistente). `git status --porcelain` do repo real idêntico ao baseline após o gate e após o sensor. `git stash list`: 0 entradas. `git worktree list`: só o worktree principal.

---

## Interactive UAT Results

Não se aplica. É setup de banco; a home não muda de comportamento (coberto por DB-21 e DB-22).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `lib/prisma.ts` tem 17 linhas, só o singleton |
| Surgical changes | ✅ Diff de `README.md`, `eslint.config.mjs`, `PROJECT.md` e `STATE.md` toca só o necessário |
| No scope creep | ✅ Sem seed, sem troca da home, sem container do Next. Observação menor: o script `postinstall: prisma generate` não está nos ACs da spec; é fixado em `tests/schema-contrato.test.mjs:53`. Está ali para o client existir após `npm install` e não quebra nada. Não bloqueia |
| Matches patterns | ✅ Testes `node --test` em `tests/*.test.mjs`, nomes `DB-NN` ligados à spec |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (Compose, Env, schema, client, migração, docs 1:1 com ACs) | ✅ |
| Every test maps to a spec requirement - no unclaimed tests | ✅ 25 testes, DB-01 a DB-25, um por requisito |
| Documented guidelines followed: none - strong defaults applied (Test Coverage Matrix de `tasks.md`) | ✅ |
| Next.js `AGENTS.md`: sem API do Next alterada nesta feature, só `prisma generate` no `build` | ✅ |

Observação não bloqueante (cobertura por contrato de texto): `tests/cliente-prisma.test.mjs:17` confere que `globalForPrisma.prisma = prisma` existe, mas não que esteja dentro do `if (process.env.NODE_ENV !== "production")` (`lib/prisma.ts:15-17`). A spec define o AC como leitura do arquivo e não pede teste de comportamento do singleton. Não foi injetado mutante nesse ponto (limite de 3 do sensor leve).

---

## Edge Cases

- [x] `postgres:latest`, `postgres:18`, `postgres:17-alpine` falham o contrato: regex ancorada em `tests/compose-contrato.test.mjs:11` (`postgres:17\s*$`)
- [x] `@default(autoincrement())` em `id` falha o contrato: `tests/schema-contrato.test.mjs:32`
- [x] Model de tag separado falha o contrato: `tests/schema-contrato.test.mjs:40`
- [x] Migração que insere fichas deixa a contagem de ser `0`: `tests/migracao-filmes.test.mjs:70` (banco real com 0 linhas)
- [x] `.env.example` ainda ignorado falha o contrato: `tests/env-contrato.test.mjs:19`, morto pela mutação 2

---

## Gate Check

- **Gate command**: `npm run lint && node --test && npm run build`
- **Result**: exit 0. Lint limpo. `node --test`: 25 testes, 25 passam, 0 falham, 0 cancelados, 0 skipped. `npm run build`: `prisma generate` gerou o client 7.10.1, Next.js 16.4.2 compilou e gerou 4 páginas estáticas (`/` e `/_not-found`).
- **Test count before feature**: 0 (não havia `tests/` em `09fc0c1`)
- **Test count after feature**: 25
- **Delta**: +25 novos testes
- **Skipped tests**: nenhum
- **Failures**: nenhuma
- **Banco**: container `postgres:17` saudável em `0.0.0.0:5432`. `npx prisma migrate status`: "Database schema is up to date!". `prisma migrate diff` (banco → schema): "No difference detected."

---

## Fix Plans (if issues found)

Nenhuma. Sem mutante sobrevivente, sem lacuna de precisão, sem AC falho.

---

## Requirement Traceability Update

`spec.md` já registra DB-01 a DB-25 como `Verified`. A verificação independente confirma os 25.

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| DB-01 a DB-06 | Verified | ✅ Verified |
| DB-07, DB-08 | Verified | ✅ Verified |
| DB-09 a DB-16 | Verified | ✅ Verified |
| DB-17 a DB-20 | Verified | ✅ Verified |
| DB-21, DB-22 | Verified | ✅ Verified |
| DB-23 a DB-25 | Verified | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 25/25 ACs batem com o desfecho da spec, 0 spec-precision gaps
**Sensor**: 3/3 mutações mortas (incluindo `new PrismaClient()` sem adapter, que sobrevivia no relatório de 2026-10-21)
**Gate**: 25 passed, 0 failed, 0 skipped; lint e build limpos

**What works**: Compose `postgres:17` com os parâmetros exatos; schema, config e singleton do Prisma 7; migração aplicada sem drift (tabela vazia, 8 colunas `NOT NULL`); home ainda em `@/lib/filmes`; documentação atualizada.

**Issues found**: nenhuma bloqueante. Duas observações menores: `postinstall` fora dos ACs, e `globalForPrisma.prisma = prisma` coberto só por presença de texto.

**Next steps**: nenhum. A feature segue não commitada, por ordem do usuário.
