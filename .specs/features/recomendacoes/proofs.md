# recomendacoes proofs

**HEAD**: 95a35d5
**Tree**: dirty - app/page.tsx, components/fileira.tsx, components/poster.tsx, app/api/recomendacoes/, components/recomendacoes.tsx
**Result**: 32 pass, 0 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `node --test --test-name-pattern "REC-01" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C2 | `node --test --test-name-pattern "REC-02" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C3 | `node --test --test-name-pattern "REC-03" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C4 | `node --test --test-name-pattern "REC-04" tests/recomendacoes-ui.test.mjs` | count unknown | - | pass |
| C5 | `node --test --test-name-pattern "REC-05" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C6 | `node --test --test-name-pattern "REC-06" tests/recomendacoes-ui.test.mjs` | count unknown | - | pass |
| C7 | `node --test --test-name-pattern "REC-07" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C8 | `node --test --test-name-pattern "REC-08" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C9 | `node --test --test-name-pattern "REC-09" tests/recomendacoes-ui.test.mjs` | count unknown | - | pass |
| C10 | `node --test --test-name-pattern "REC-10" tests/recomendacoes-ui.test.mjs` | count unknown | - | pass |
| C11 | `node --test --test-name-pattern "REC-11" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C12 | `node --test --test-name-pattern "REC-12" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C13 | `node --test --test-name-pattern "REC-13" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C14 | `node --test --test-name-pattern "REC-14" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C15 | `node --test --test-name-pattern "REC-15" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C16 | `node --test --test-name-pattern "REC-16" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C17 | `node --test --test-name-pattern "REC-17" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C18 | `node --test --test-name-pattern "REC-18" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C19 | `node --test --test-name-pattern "REC-19" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C20 | `node --test --test-name-pattern "REC-20" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C21 | `node --test --test-name-pattern "REC-21" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C22 | `node --test --test-name-pattern "REC-22" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C23 | `node --test --test-name-pattern "REC-23" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C24 | `node --test --test-name-pattern "REC-24" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C25 | `node --test --test-name-pattern "REC-25" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C26 | `node --test --test-name-pattern "REC-26" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C27 | `node --test --test-name-pattern "REC-27" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C28 | `node --test --test-name-pattern "REC-28" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| C29 | `node --test --test-name-pattern "REC-29" tests/recomendacoes.test.mjs` | count unknown | - | pass |
| Build | `npm run lint` | - | - | pass |
| Build | `node --test` | - | - | pass |
| Build | `npm run build` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| peso do gênero usa o candidato | `lib/recomendacoes.mjs:96` | yes |
| desempate de elenco ignora pessoaId | `lib/recomendacoes.mjs:81` | yes |
| coleção deixa de incluir o candidato | `lib/recomendacoes.mjs:113` | yes |
