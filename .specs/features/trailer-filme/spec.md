# Trailer na tabela filmes

**Approved**: 2026-11-03 - user: "faça"

## Problem Statement

O JSON em `data/tmdb` já tem `trailer_url` em cada filme. A tabela `filmes` não tem essa coluna, e o seed não grava o valor. Quem consulta o PostgreSQL não encontra o link do YouTube.

## Goals

- [x] A tabela `filmes` ganha a coluna anulável `trailer_url`
- [x] `npm run db:seed` grava o texto do JSON, ou NULL quando o JSON traz `null`
- [x] A segunda execução do seed mantém a URL e a contagem de 72 filmes

## Out of Scope

| Feature | Reason |
| --- | --- |
| Mostrar o trailer na home ou em outra tela | O pedido é só persistir |
| Buscar o trailer de novo na API do TMDB | A URL já está no JSON do recorte |
| Tabela nova para o trailer | O pedido é a mesma tabela `filmes` |
| Commit git | Esta feature não inclui commit |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Onde o valor entra | A migração nova só adiciona a coluna. O seed copia `trailer_url` do JSON | O catálogo já entra por `npm run db:seed`, que apaga e regrava. A migração não embute as 72 URLs | y |
| Nome e tipo | Coluna `trailer_url` `TEXT` NULL. No Prisma, `trailerUrl String? @map("trailer_url")` | Igual a `homepage` e ao campo que já está no JSON | y |
| Posição | Última coluna, depois de `colecao_id` | `ADD COLUMN` acrescenta no fim. O teste CAT-11 passa a esperar essa coluna no fim da lista | y |
| Filme sem URL | NULL, não string vazia | O filme `1770234` tem `trailer_url` `null` | y |
| Chave ausente no JSON | O seed grava NULL | O mesmo tratamento de `homepage` quando o campo não vem | y |
| Seed repetido | A transação atual apaga e reinsere | A segunda execução não duplica a linha nem troca a URL | y |
| Migração antiga | `catalogo_tmdb` não é editada | O banco já aplicou essa migração | y |
| Demais dimensões (auth, pagamento, TTL, observabilidade, concorrência) | N/A para este escopo | Não há usuário, chamada externa no seed, nem expiração da URL | y |

**Open questions:** none

---

## User Stories

### P1: Gravar a URL do trailer em `filmes` ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero a URL do YouTube na mesma tabela do filme para o banco refletir o `trailer_url` de `data/tmdb`.

**Why P1**: Sem a coluna e sem o seed, o JSON não chega ao PostgreSQL.

**Acceptance Criteria**:

1. The model `Filme` SHALL mapear `trailerUrl` como `String?` com `@map("trailer_url")`.
2. WHEN a migração nova é aplicada THEN a tabela `filmes` SHALL ter a coluna `trailer_url` do tipo `text`, anulável, na última posição, depois de `colecao_id`.
3. WHEN o seed roda sobre `data/tmdb` THEN o filme `969681` SHALL ter `trailer_url` igual a `https://www.youtube.com/watch?v=bwt2-nyEP0A`.
4. WHEN o seed roda sobre `data/tmdb` THEN o filme `155` SHALL ter `trailer_url` igual a `https://www.youtube.com/watch?v=oFJ7Yry2p18`.
5. WHEN o seed roda sobre `data/tmdb` THEN o filme `1770234` SHALL ter `trailer_url` NULL.
6. WHEN o seed roda uma segunda vez sobre `data/tmdb` THEN o filme `969681` SHALL manter `trailer_url` `https://www.youtube.com/watch?v=bwt2-nyEP0A`.
7. WHEN o seed roda sobre `data/tmdb` THEN `filmes` SHALL ter `71` linhas cujo `trailer_url` começa com `https://www.youtube.com/watch?v=`.
8. WHEN o seed roda sobre `data/tmdb` THEN `filmes` SHALL ter `1` linha com `trailer_url` NULL.
9. The migration `prisma/migrations/20261103104300_trailer_filme/migration.sql` SHALL contain `ADD COLUMN "trailer_url" TEXT` and SHALL NOT contain `NOT NULL`.
10. WHEN o seed roda sobre `data/tmdb` THEN cada filme SHALL ter `trailer_url` igual ao campo `trailer_url` do JSON da primeira lista em que ele aparece, na ordem `popular`, `now_playing`, `upcoming`, `top_rated`.
11. IF um filme não tem a chave `trailer_url` THEN o seed SHALL gravar NULL nessa linha.

**Independent Test**: Rodar a migração e o seed sobre `data/tmdb` e ler `trailer_url` dos filmes `969681`, `155` e `1770234`.

---

## Edge Cases

- O filme `1770234` cobre o JSON com `trailer_url` `null`: o banco grava NULL (AC 5).
- Chave ausente no JSON grava NULL, no mesmo caminho de `homepage`. Não há filme assim no recorte.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| TRL-01 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-02 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-03 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-04 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-05 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-06 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-07 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-08 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-09 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-10 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |
| TRL-11 | P1: Gravar a URL do trailer em `filmes` | Execute | Verified |

**Coverage:** 11 total, 11 mapped to checks, 0 unmapped

---

## Sources

- Pedido de gravar a URL do trailer na tabela `filmes`, com migração
- `data/tmdb`: campo `trailer_url` já preenchido no recorte
- AD-006: o seed lê `data/tmdb` e regrava o catálogo

---

## Success Criteria

- [x] A coluna `trailer_url` existe em `filmes` e aceita NULL
- [x] Depois do seed, o filme `969681` aponta para `https://www.youtube.com/watch?v=bwt2-nyEP0A`
- [x] O filme `1770234` fica com NULL
- [x] A segunda execução do seed deixa 72 filmes e a mesma URL

## Checks

**Mutations**: 3
**Build**: `npm run lint; node --test; npm run build`

**C1** - O model `Filme` mapeia `trailerUrl` como `String?` em `trailer_url` (TRL-01, AC 1)
Proof: `node --test --test-name-pattern "TRL-01" tests/schema-contrato.test.mjs`

**C2** - `filmes.trailer_url` é `text`, anulável, e é a última coluna, depois de `colecao_id` (TRL-02, AC 2)
Proof: `node --test --test-name-pattern "TRL-02" tests/migracao-filmes.test.mjs`

**C3** - O filme `969681` fica com `https://www.youtube.com/watch?v=bwt2-nyEP0A` (TRL-03, AC 3)
Proof: `node --test --test-name-pattern "TRL-03" tests/catalogo-seed.test.mjs`

**C4** - O filme `155` fica com `https://www.youtube.com/watch?v=oFJ7Yry2p18` (TRL-04, AC 4)
Proof: `node --test --test-name-pattern "TRL-04" tests/catalogo-seed.test.mjs`

**C5** - O filme `1770234` fica com `trailer_url` NULL (TRL-05, AC 5)
Proof: `node --test --test-name-pattern "TRL-05" tests/catalogo-seed.test.mjs`

**C6** - O segundo seed mantém `https://www.youtube.com/watch?v=bwt2-nyEP0A` no filme `969681` (TRL-06, AC 6)
Proof: `node --test --test-name-pattern "TRL-06" tests/catalogo-seed.test.mjs`

**C7** - 71 linhas têm URL que começa com `https://www.youtube.com/watch?v=` (TRL-07, AC 7)
Proof: `node --test --test-name-pattern "TRL-07" tests/catalogo-seed.test.mjs`

**C8** - 1 linha tem `trailer_url` NULL (TRL-08, AC 8)
Proof: `node --test --test-name-pattern "TRL-08" tests/catalogo-seed.test.mjs`

**C9** - A migração declara `ADD COLUMN "trailer_url" TEXT` e não declara `NOT NULL` (TRL-09, AC 9)
Proof: `node --test --test-name-pattern "TRL-02" tests/migracao-filmes.test.mjs`

**C10** - Cada `trailer_url` gravado é o texto do JSON na primeira lista do filme (TRL-10, AC 10)
Proof: `node --test --test-name-pattern "TRL-07" tests/catalogo-seed.test.mjs`

**C11** - Filme sem a chave `trailer_url` fica com NULL (TRL-11, AC 11)
Proof: `node --test --test-name-pattern "TRL-05" tests/catalogo-seed.test.mjs`

## Handoff

**Dispatched:** Verifier, feature `trailer-filme`, working tree at HEAD `1ad375e`. Files: `prisma/schema.prisma`, `prisma/migrations/20261103104300_trailer_filme/migration.sql`, `prisma/seed.mjs`, `tests/schema-contrato.test.mjs`, `tests/migracao-filmes.test.mjs`, `tests/catalogo-seed.test.mjs`. No screens sub-agent: no criterion cites a capture. Verifier returned.
