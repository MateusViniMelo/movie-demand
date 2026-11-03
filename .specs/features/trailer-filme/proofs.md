# trailer-filme proofs

**HEAD**: 1ad375e
**Tree**: dirty - data/tmdb/now_playing.json, data/tmdb/popular.json, data/tmdb/top_rated.json, data/tmdb/upcoming.json, prisma/schema.prisma
**Result**: 14 pass, 0 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `node --test --test-name-pattern "TRL-01" tests/schema-contrato.test.mjs` | count unknown | - | pass |
| C2 | `node --test --test-name-pattern "TRL-02" tests/migracao-filmes.test.mjs` | count unknown | - | pass |
| C3 | `node --test --test-name-pattern "TRL-03" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C4 | `node --test --test-name-pattern "TRL-04" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C5 | `node --test --test-name-pattern "TRL-05" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C6 | `node --test --test-name-pattern "TRL-06" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C7 | `node --test --test-name-pattern "TRL-07" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C8 | `node --test --test-name-pattern "TRL-08" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C9 | `node --test --test-name-pattern "TRL-02" tests/migracao-filmes.test.mjs` | count unknown | - | pass |
| C10 | `node --test --test-name-pattern "TRL-07" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| C11 | `node --test --test-name-pattern "TRL-05" tests/catalogo-seed.test.mjs` | count unknown | - | pass |
| Build | `npm run lint` | - | - | pass |
| Build | `node --test` | - | - | pass |
| Build | `npm run build` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| coluna da migração vira varchar NOT NULL | `prisma/migrations/20261103104300_trailer_filme/migration.sql:1` | yes |
| URL dos outros filmes vira prefixo fixo | `prisma/seed.mjs:164` | yes |
| chave ausente vira string vazia | `prisma/seed.mjs:164` | yes |
