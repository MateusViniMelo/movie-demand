# pagina-filme proofs

**HEAD**: 67d71cb
**Tree**: dirty - components/busca.tsx, components/hero.tsx, components/poster.tsx, tests/busca-ui.test.mjs, tests/home-fonte.test.mjs
**Result**: 16 pass, 0 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `node --test --test-name-pattern "PAG-01" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C2 | `node --test --test-name-pattern "PAG-02" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C3 | `node --test --test-name-pattern "PAG-03" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C4 | `node --test --test-name-pattern "PAG-04" tests/filme.test.mjs` | count unknown | - | pass |
| C5 | `node --test --test-name-pattern "PAG-05" tests/filme.test.mjs` | count unknown | - | pass |
| C6 | `node --test --test-name-pattern "PAG-06" tests/filme.test.mjs` | count unknown | - | pass |
| C7 | `node --test --test-name-pattern "PAG-07" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C8 | `node --test --test-name-pattern "PAG-08" tests/filme.test.mjs` | count unknown | - | pass |
| C9 | `node --test --test-name-pattern "PAG-09" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C10 | `node --test --test-name-pattern "PAG-10" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C11 | `node --test --test-name-pattern "PAG-11" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C12 | `node --test --test-name-pattern "PAG-12" tests/filme-ui.test.mjs` | count unknown | - | pass |
| C13 | `node --test --test-name-pattern "PAG-13" tests/filme-ui.test.mjs` | count unknown | - | pass |
| Build | `npm run lint` | - | - | pass |
| Build | `node --test` | - | - | pass |
| Build | `npm run build` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| C1 poster id comes from posicao instead of linha.id | `lib/cartaz.mjs:53` | yes |
| C3 search row id off by one | `lib/busca.mjs:36` | yes |
| C4 page still rendered at w500 instead of w1280 | `app/filme/[id]/page.tsx:52` | yes |
