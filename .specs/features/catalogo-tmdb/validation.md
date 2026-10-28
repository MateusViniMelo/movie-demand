# Catálogo TMDB Validation

**Date**: 2026-10-27
**Spec**: `.specs/features/catalogo-tmdb/spec.md`
**Diff range**: worktree sem commits (HEAD `58c324d` + alterações não commitadas). Arquivos da feature: `prisma/schema.prisma`, `prisma/migrations/20261027233949_catalogo_tmdb/migration.sql`, `prisma/seed.mjs`, `prisma.config.ts`, `package.json` (`db:seed`), `README.md`, `.specs/project/STATE.md`, `tests/schema-contrato.test.mjs`, `tests/migracao-filmes.test.mjs`, `tests/catalogo-seed.test.mjs`, `tests/docs-contrato.test.mjs`, `tests/home-fonte.test.mjs`.
**Verifier**: sub-agente independente (autor ≠ verificador). Relatório reescrito do zero; o `validation.md` anterior (FAIL) foi descartado sem ser usado como evidência.

**Result**: PASS ✅

Os 38 critérios (CAT-01 a CAT-38) e os 5 edge cases têm citação `file:line` com asserção que bate com o desfecho da spec. O gate está verde (63 passaram, 0 falharam). Os 5 mutantes no seed foram mortos. Há um desvio registrado (`SPEC_DEVIATION`) e duas observações de precisão de teste, sem bloqueio.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Declarar models | ✅ Done | `prisma/schema.prisma:10-117`; DB-09, DB-10, DB-11 e DB-16 mantidos em `tests/schema-contrato.test.mjs:10,16,23,144` |
| T2 Migração | ✅ Done | `migration.sql:2` (`DROP TABLE "filmes"`) e `:5` (`DROP TYPE "Origem"`), zero `INSERT`; DB-20 mantido em `tests/migracao-filmes.test.mjs:176` |
| T3 Seed | ✅ Done | `prisma/seed.mjs` + `tests/catalogo-seed.test.mjs`; desvio `SPEC_DEVIATION` em `seed.mjs:1-2` (grava com `pg`, não com PrismaClient) |
| T4 Comando do seed | ✅ Done | `prisma.config.ts:8` `seed: "node prisma/seed.mjs"`; `package.json:13` `"db:seed": "prisma db seed"` |
| T5 README | ✅ Done | `README.md` cita `npm run db:seed` e `data/tmdb`; a frase da tabela vazia saiu (nenhum `vazia`/`vazio` no arquivo) |
| T6 AD-006 | ✅ Done | `.specs/project/STATE.md:45-50`; `tests/home-fonte.test.mjs` verde |

---

## Spec-Anchored Acceptance Criteria

### P1: Substituir o model do experimento (`node --test tests/schema-contrato.test.mjs`)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| CAT-01 schema lido → omite `Origem` | nenhum `enum Origem` | `tests/schema-contrato.test.mjs:33` - `assert.equal(/enum\s+Origem\b/.test(schema), false)` | ✅ PASS |
| CAT-02 model `Filme` | `@@map("filmes")`, `id Int @id` sem `autoincrement`, 26 campos com tipo, nulabilidade, `@map` e `@db.Date` da spec | `:37-65` - `assert.match(filme, /@@map\("filmes"\)/)`, `:39` `/id\s+Int(?!\?)\s+@id\b/`, `:40` `assert.equal(filme.includes("autoincrement"), false)`, `:59` `/receita\s+BigInt(?!\?)/`, `:65` `/colecaoId\s+Int\?\s+@map\("colecao_id"\)/` (um `match` por campo, com `(?!\?)` para os não nulos) | ✅ PASS |
| CAT-03 model `Filme` omite campos do experimento | sem `descricao`, `urlMidia`, `origem`, `tags`, `genero String` | `:70-74` - `assert.equal(/\bdescricao\b/.test(filme), false)`, `filme.includes("urlMidia")` `false`, `/\borigem\b/` `false`, `/\btags\b/` `false`, `/genero\s+String/` `false` | ✅ PASS |
| CAT-04 `Genero` | `generos`, `id Int @id`, `nome String` | `:78-81` - `assert.match(genero, /@@map\("generos"\)/)`, `/id\s+Int(?!\?)\s+@id\b/`, `/nome\s+String(?!\?)/` | ✅ PASS |
| CAT-05 `Colecao` | `colecoes`, `id`, `nome`, `posterPath?`, `backdropPath?` com `@map` | `:85-91` - `assert.match(colecao, /@@map\("colecoes"\)/)` … `/backdropPath\s+String\?\s+@map\("backdrop_path"\)/` | ✅ PASS |
| CAT-06 `FilmeGenero` | `filme_generos`, `@@id([filmeId, generoId])` | `:95-96` - `assert.match(vinculo, /@@map\("filme_generos"\)/)`, `/@@id\(\[filmeId, generoId\]\)/` | ✅ PASS |
| CAT-07 `Pessoa` | `pessoas` e 8 campos com `@map` onde a spec manda | `:100-109` - `assert.match(pessoa, /nomeOriginal\s+String(?!\?)\s+@map\("nome_original"\)/)`, `/fotoPath\s+String\?\s+@map\("foto_path"\)/` e demais | ✅ PASS |
| CAT-08 `Elenco` | `elenco`, `creditId @id @map("credit_id")`, `filmeId`, `pessoaId`, `personagem`, `ordem`, `castId` | `:113-120` - `assert.match(elenco, /creditId\s+String(?!\?)\s+@id\s+@map\("credit_id"\)/)`, `/castId\s+Int(?!\?)\s+@map\("cast_id"\)/` e demais | ✅ PASS |
| CAT-09 `Lista` | `listas`, `slug String @id` | `:124-126` - `assert.match(lista, /@@map\("listas"\)/)`, `/slug\s+String(?!\?)\s+@id\b/` | ✅ PASS |
| CAT-10 `ListaFilme` | `lista_filmes`, `@@id([listaSlug, filmeId])`, `@@unique([listaSlug, posicao])` | `:131-133` - `assert.match(posicao, /@@id\(\[listaSlug, filmeId\]\)/)`, `/@@unique\(\[listaSlug, posicao\]\)/` | ✅ PASS |

### P1: Criar as tabelas do catálogo (`node --test tests/migracao-filmes.test.mjs`, contra o Postgres real)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CAT-11 `filmes` | 26 colunas, nesta ordem, com tipo e `is_nullable` | `tests/migracao-filmes.test.mjs:55-83` - `assert.deepEqual(rows, [["id","NO","integer"], … ["receita","NO","bigint"], … ["colecao_id","YES","integer"]])` (ordenado por `ordinal_position`, `jsonb` via `udt_name`) | ✅ PASS |
| CAT-12 `generos` | `id` integer NO, `nome` text NO | `:87` - `assert.deepEqual(rows, [["id","NO","integer"],["nome","NO","text"]])` | ✅ PASS |
| CAT-13 `colecoes` | `id`, `nome` NO; `poster_path` e `backdrop_path` YES | `:95` - `assert.deepEqual(rows, [… ["poster_path","YES","text"], ["backdrop_path","YES","text"]])` | ✅ PASS |
| CAT-14 `filme_generos` | PK `(filme_id, genero_id)` | `:105` - `assert.deepEqual(rows, ['PRIMARY KEY (filme_id, genero_id)'])` | ✅ PASS |
| CAT-15 `pessoas` | 8 colunas com tipo e nulabilidade | `:110` - `assert.deepEqual(rows, [["id","NO","integer"], … ["foto_path","YES","text"]])` | ✅ PASS |
| CAT-16 `elenco` | PK `credit_id` e 6 colunas | `:125` - `assert.deepEqual(cols, [["credit_id","NO","text"], … ["cast_id","NO","integer"]])`; `:133` `assert.deepEqual(keys, ["PRIMARY KEY (credit_id)"])` | ✅ PASS |
| CAT-17 `listas` | PK `slug` | `:138` - `assert.deepEqual(keys, ["PRIMARY KEY (slug)"])` | ✅ PASS |
| CAT-18 `lista_filmes` | PK `(lista_slug, filme_id)`, `posicao` integer NO, unicidade `(lista_slug, posicao)` | `:150` `assert.deepEqual(cols, [… ["posicao","NO","integer"]])`; `:155` `assert.deepEqual(keys, ["PRIMARY KEY (lista_slug, filme_id)"])`; `:156-160` `indexdef === "CREATE UNIQUE INDEX lista_filmes_lista_slug_posicao_key ON public.lista_filmes USING btree (lista_slug, posicao)"` → `true` | ✅ PASS |
| CAT-19 sem tipo `Origem` | nenhuma linha em `pg_type` | `:166` - `assert.equal(rows.rowCount, 0)` | ✅ PASS |
| CAT-20 SQL derruba `filmes` e omite `INSERT` | `DROP TABLE "filmes"`, sem `INSERT` | `:172` - `assert.match(sql, /DROP TABLE "filmes"/)`; `:173` `assert.equal(sql.includes("INSERT"), false)` (SQL real: `migration.sql:2`, zero ocorrências de `INSERT`) | ✅ PASS |

### P1: Gravar o recorte de `data/tmdb` (`node --test tests/catalogo-seed.test.mjs`, contra o Postgres real)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CAT-21 contagens | 72 / 19 / 16 / 2563 / 2680 / 4 / 80 | `tests/catalogo-seed.test.mjs:61` - `assert.deepEqual(await contagens(client), ESPERADO)` com `ESPERADO` em `:18-25` (`filmes: 72, generos: 19, colecoes: 16, pessoas: 2563, elenco: 2680, listas: 4, lista_filmes: 80`) | ✅ PASS |
| CAT-22 filme `969681` | título, duração `143`, orçamento `225000000`, receita `2517281128`, data `2026-07-29`, coleção `531241`, `Marvel Studios` | `:71-77` - `assert.equal(filme.titulo, "Homem-Aranha: Um Novo Dia")`, `:72` `duracao_min, 143`, `:73` `orcamento, 225000000`, `:74` `receita, "2517281128"` (`receita::text`), `:75` `data_lancamento, "2026-07-29"`, `:76` `colecao_id, 531241`, `:77` `empresas.some(… "Marvel Studios") === true` | ✅ PASS |
| CAT-23 nota | `abs(nota_media − 8.473) < 0.000001` | `:82` - `assert.equal(Math.abs(rows.rows[0].nota_media - 8.473) < 0.000001, true)` | ✅ PASS |
| CAT-24 sinopse vazia (`1712451`) | `""` | `:87` - `assert.equal(rows.rows[0].sinopse, "")` | ✅ PASS |
| CAT-25 gênero `28` | `Ação` | `:92` - `assert.equal(rows.rows[0].nome, "Ação")` | ✅ PASS |
| CAT-26 crédito `52fe4220c3a36847f8005d17` | filme `155`, pessoa `3894` `Christian Bale`, `Bruce Wayne`, ordem `0` | `:103-107` - `assert.equal(credito.filme_id, 155)`, `pessoa_id, 3894`, `nome, "Christian Bale"`, `personagem, "Bruce Wayne"`, `ordem, 0` | ✅ PASS |
| CAT-27 posição `1` | `969681` popular, `1058424` now_playing, `1232569` upcoming, `1560520` top_rated | `:114-123` - `assert.deepEqual(rows.rows.map(row => [row.lista_slug, row.filme_id]), [["now_playing",1058424],["popular",969681],["top_rated",1560520],["upcoming",1232569]])` | ✅ PASS |
| CAT-28 posições 1..20 e 8 filmes repetidos | cada lista com 20, mín 1, máx 20; 8 filmes em mais de uma lista | `:130-139` - `assert.deepEqual(faixas…, [["now_playing",20,1,20], …])`; `:144` `assert.equal(repetidos.rows[0].total, 8)` | ✅ PASS |
| CAT-29 segunda execução | `72`, `2680`, `80` | `:148` roda `semear` de novo; `:150-152` `assert.equal(totais.filmes, 72)`, `elenco, 2680`, `lista_filmes, 80` | ✅ PASS |
| CAT-30 lista com `0` e `21` | erro com `popular` e `20`; contagens do recorte válido | `:157` `for (const total of [0, 21])`; `:162` `assert.equal(error.message.includes("popular"), true)`; `:163` `includes("20")`; `:167-169` `totais.filmes, 72` / `elenco, 2680` / `lista_filmes, 80` | ✅ PASS |
| CAT-31 elenco ausente | erro com `elenco/` e o id; contagens válidas | `:186` - `assert.match(error.message, /elenco\/1\.json/)` (mais estrito que a spec); `:190-192` contagens `72`/`2680`/`80` | ✅ PASS |
| CAT-32 gênero ausente | erro com o id; contagens válidas | `:209` - `assert.equal(error.message.includes("99999"), true)`; `:213-215` contagens `72`/`2680`/`80` | ✅ PASS |
| CAT-33 `prisma.config.ts` | `migrations.seed` = `node prisma/seed.mjs` | `tests/schema-contrato.test.mjs:137` - `assert.match(config, /seed:\s*"node prisma\/seed\.mjs"/)` (ver observação O-1) | ✅ PASS |
| CAT-34 `package.json` | `db:seed` = `prisma db seed` | `:141` - `assert.equal(pkg.scripts["db:seed"], "prisma db seed")` | ✅ PASS |

### P1: Não mudar a fonte da home (`node --test tests/home-fonte.test.mjs`)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CAT-35 `app/page.tsx` importa `filmes` de `@/lib/filmes` | import presente | `tests/home-fonte.test.mjs:8` - `assert.match(page, /import \{[^}]*\bfilmes\b[^}]*\} from "@\/lib\/filmes"/)` | ✅ PASS |
| CAT-36 sem `@/lib/prisma` nem `generated/prisma` | ausentes | `:12` - `assert.equal(page.includes("@/lib/prisma"), false)`; `:13` `assert.equal(page.includes("generated/prisma"), false)` | ✅ PASS |

### P1: Documentar o seed (`node --test tests/docs-contrato.test.mjs`)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| CAT-37 README cita `npm run db:seed` e `data/tmdb` | ambos presentes | `tests/docs-contrato.test.mjs:15` - `assert.equal(readme.includes("npm run db:seed"), true)`; `:16` `assert.equal(readme.includes("data/tmdb"), true)` | ✅ PASS |
| CAT-38 `STATE.md` registra `AD-006` | substituição das colunas e home em `lib/filmes.ts` | `:20` `state.split("### AD-006")[1]`; `:21` `assert.match(decisao, /Substituir as colunas do experimento/)`; `:22` `assert.match(decisao, /lib\/filmes\.ts/)` (ver observação O-2) | ✅ PASS |

**Status**: ✅ 38/38 critérios cobertos com asserção que bate com o desfecho da spec. Nenhum ⚠️ Spec-precision gap: a spec define desfecho exato em todos os critérios (incluindo as mensagens de erro, pelo Assumptions). Duas observações de rigor dos testes estão em "Code Quality".

---

## Interactive UAT Results

N/A. A feature é infraestrutura de dados (schema, migração, seed); a UI não mudou (CAT-35 e CAT-36 travam a home).

---

## Discrimination Sensor

Isolamento: a feature não está commitada, então `git worktree add HEAD` não a contém e `git stash` é proibido. Procedimento usado: baseline de `git status --porcelain` e `sha256` dos 12 arquivos da feature; cópia `/tmp/seed.orig.mjs`; uma mutação por vez só em `prisma/seed.mjs`; `cmp` após cada restauração. As mutações gravam no Postgres real; depois da última, o seed original foi restaurado e `node --test tests/catalogo-seed.test.mjs` rodou de novo para devolver o banco ao recorte válido (13 passaram, 0 falharam).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `prisma/seed.mjs:21` | Condição `data.results.length !== 20` → `data.results.length < 20` (aceita 21 resultados) | ✅ Killed por `CAT-30` (o caso `21` não lança mais; 11 passaram, 2 falharam) |
| M2 | `prisma/seed.mjs:44` | Off-by-one na posição: `posicao: index + 1` → `index + 2` | ✅ Killed por `CAT-27` e `CAT-28` (10 passaram, 3 falharam) |
| M3 | `prisma/seed.mjs:83` | Efeito colateral removido: apagada a linha `DELETE FROM lista_filmes` | ✅ Killed por `CAT-21`, `CAT-27`, `CAT-28`, `CAT-29` (8 passaram, 5 falharam) |
| M4 | `prisma/seed.mjs:156` | Valor de retorno errado: `String(filme.revenue)` → `String(Math.min(filme.revenue, 2147483647))` (trunca a receita a 2^31-1) | ✅ Killed por `CAT-22` (11 passaram, 2 falharam) |
| M5 | `prisma/seed.mjs:26` | Validação de gênero desligada: `if (!generoIds.has(genero.id))` → `if (false)` | ✅ Killed por `CAT-32` (11 passaram, 2 falharam) |

**Sensor depth**: lightweight (5 mutações manuais, acima do mínimo de 3; a feature é carga de dados, não pagamento nem auth)
**Result**: 5/5 killed - PASS ✅

**Verificação de isolamento**: após `cp /tmp/seed.orig.mjs prisma/seed.mjs`, `cmp` sem diferença; `git status --porcelain` idêntico ao baseline; `sha256sum` dos 12 arquivos idêntico ao baseline. O sensor é válido.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `seed.mjs` tem `carregarCatalogo`, `insertMany` e `semear`; sem camada extra |
| Surgical changes | ✅ Só os arquivos do escopo da feature |
| No scope creep | ✅ Sem tabela de equipe nem busca (fora de escopo da spec) |
| Matches patterns | ✅ Testes de contrato no estilo `DB-*` já existente (`withClient`, `readFileSync`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ 38/38 |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ schema 1:1 com CAT-01..10; migração CAT-11..20; seed com contagens, amostra, segunda execução e as três falhas (`0`/`21`, elenco, gênero) |
| Every test maps to a spec requirement - no unclaimed tests | ✅ Os `DB-*` restantes são testes herdados de `setup-postgres-prisma` e a task T1/T2 exige mantê-los |
| Documented guidelines followed | ✅ none - strong defaults applied (tasks.md: "Guidelines found: none") |

**Observações de rigor (não bloqueiam; nenhuma é AC sem evidência):**

- **O-1** `tests/schema-contrato.test.mjs:137` casa `seed:\s*"node prisma\/seed\.mjs"` no arquivo inteiro, sem ancorar no bloco `migrations`. O valor é o exato da spec, mas um `seed:` fora de `migrations` também passaria. Não foi mutado (o sensor só toca `seed.mjs`); é leitura estática.
- **O-2** `tests/docs-contrato.test.mjs:20` usa `state.split("### AD-006")[1]`, que vai até o fim do arquivo e não só até o fim da seção. Hoje `AD-006` é a última decisão, então o resultado é correto; uma decisão futura com `lib/filmes.ts` poderia mascarar a falta dele no `AD-006`.
- **O-3** O README não tem teste para "a frase de tabela vazia sai" (item de Done-when de T5, não AC). Conferido à mão: nenhum `vazia`/`vazio` em `README.md`.
- **O-4** Os testes do seed gravam no Postgres real e trocam o conteúdo das tabelas; qualquer fixture inválida que passe a validação (como no mutante M1) deixa o banco com dados de teste até a próxima execução do seed.

**`SPEC_DEVIATION` confirmado**: `prisma/seed.mjs:1-2` ainda tem o marcador (`seed grava com pg em vez de PrismaClient`; razão: `generated/prisma/client.ts` importa TypeScript sem extensão, que `node prisma/seed.mjs` não carrega). A spec não exige PrismaClient (CAT-21 a CAT-34 pedem só o desfecho no banco), mas `tasks.md` T3 diz "Reuses: `PrismaPg` como em `lib/prisma.ts`". É um desvio do plano, não da spec; o marcador foi mantido.

---

## Edge Cases

- [x] `popular` com `0` ou `21` resultados lança erro com `popular` e `20` e mantém as contagens: `tests/catalogo-seed.test.mjs:157,162-163,167-169`
- [x] Elenco do filme `1` ausente lança erro com `elenco/1` e mantém as contagens: `:186,190-192`
- [x] Gênero `99999` lança erro com `99999` e mantém as contagens: `:209,213-215`
- [x] Filme `1712451` com `overview` vazio grava `sinopse` `""`: `:87`
- [x] SQL da migração não contém `INSERT`: `tests/migracao-filmes.test.mjs:173`

---

## Gate Check

- **Gate command**: `npm run lint && node --test && npm run build` (de `/home/fenext04/projetos/movie-demand`)
- **Result**: exit `0`. Lint sem avisos. `node --test`: 63 passaram, 0 falharam, 0 cancelados, 0 pulados, 0 todo. `next build` compilou, rodou o TypeScript e gerou as 4 páginas estáticas.
- **Test count before feature**: 25 testes nos 7 arquivos de `tests/` do HEAD `58c324d` (15 nos 4 arquivos tocados: `docs` 3, `home-fonte` 2, `migracao-filmes` 4, `schema-contrato` 6)
- **Test count after feature**: 63 no total. Desses, 6 são de `tests/fileira-swiper.test.mjs` (feature `swiper-fileiras`, fora de escopo). Os testes da feature `catalogo-tmdb` somam 47 (`docs` 5, `home-fonte` 2, `migracao-filmes` 11, `schema-contrato` 16, `catalogo-seed` 13 com a suíte-pai); os 10 restantes são `cliente-prisma`, `compose-contrato` e `env-contrato`, sem mudança.
- **Delta**: +32 testes nos arquivos da feature (15 → 47); nenhum teste removido. DB-09, DB-10, DB-11, DB-16, DB-20, DB-21..DB-25 seguem presentes.
- **Skipped tests**: nenhum
- **Failures**: nenhuma

**Test Integrity Check**: contagem não diminuiu. As asserções antigas da migração e do schema foram trocadas pelas do catálogo (a spec substitui o model), não enfraquecidas.

---

## Fix Plans

Nenhum. Nenhum mutante sobreviveu, nenhum AC ficou sem evidência. As observações O-1 e O-2 podem virar um endurecimento opcional (ancorar `seed:` no bloco `migrations` e cortar `AD-006` na próxima `###`), sem prioridade de bloqueio (Cosmetic).

---

## Requirement Traceability Update

`spec.md` não foi editado pelo Verifier (regra desta rodada: só `validation.md`). Status derivado, para o orquestrador aplicar se quiser:

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CAT-01 a CAT-10 | Pending | ✅ Verified |
| CAT-11 a CAT-20 | Pending | ✅ Verified |
| CAT-21 a CAT-34 | Pending | ✅ Verified |
| CAT-35, CAT-36 | Pending | ✅ Verified |
| CAT-37, CAT-38 | Pending | ✅ Verified |

---

## Out-of-scope worktree noise

O worktree também contém a feature `swiper-fileiras` (`app/globals.css`, `components/fileira.tsx`, `components/poster.tsx`, `tests/fileira-swiper.test.mjs`, `swiper` em `package.json` e `package-lock.json`, `.claude/napkin.md`, `.specs/LESSONS.md`, `.specs/lessons.json`). Não foi julgada nem editada. Os 6 testes dela entram na contagem do `node --test` (63) e passaram.

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 38/38 ACs e 5/5 edge cases batem com o desfecho da spec; 0 spec-precision gaps
**Sensor**: 5/5 mutações mortas (inclui `!== 20` → `< 20`, off-by-one de posição e remoção de `DELETE FROM lista_filmes`)
**Gate**: 63 passaram, 0 falharam, lint e build verdes

**What works**: schema com os 8 models, migração aplicada com colunas e chaves exatas, seed idempotente com as três falhas sem escrita, script e config do seed, home intacta, README e AD-006.

**Issues found**: nenhuma que bloqueie. O-1 e O-2 são rigor de teste; o `SPEC_DEVIATION` do seed (`pg` no lugar de PrismaClient) segue registrado.

**Next steps**: aplicar a tabela de rastreabilidade em `spec.md`; commit continua proibido nesta feature.
