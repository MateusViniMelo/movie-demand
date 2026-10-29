# seo proofs

**HEAD**: 4d55e4a
**Tree**: clean
**Result**: 13 pass, 0 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `node --test --test-name-pattern "SEO-01" tests/seo.test.mjs` | count unknown | - | pass |
| C2 | `node --test --test-name-pattern "SEO-02" tests/seo.test.mjs` | count unknown | - | pass |
| C3 | `node --test --test-name-pattern "SEO-03" tests/seo.test.mjs` | count unknown | - | pass |
| C4 | `node --test --test-name-pattern "SEO-04" tests/seo.test.mjs` | count unknown | - | pass |
| C5 | `node --test --test-name-pattern "SEO-05" tests/seo.test.mjs` | count unknown | - | pass |
| C6 | `node --test --test-name-pattern "SEO-06" tests/seo.test.mjs` | count unknown | - | pass |
| C7 | `node --test --test-name-pattern "SEO-07" tests/seo.test.mjs` | count unknown | - | pass |
| C8 | `node --test --test-name-pattern "SEO-08" tests/seo.test.mjs` | count unknown | - | pass |
| C9 | `node --test --test-name-pattern "SEO-09" tests/seo.test.mjs` | count unknown | - | pass |
| C10 | `node --test --test-name-pattern "SEO-10" tests/seo.test.mjs` | count unknown | - | pass |
| Build | `npm run lint` | - | - | pass |
| Build | `node --test` | - | - | pass |
| Build | `npm run build` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| http absoluto vira localhost | `lib/seo.mjs:23` | yes |
| porta fora da origem | `lib/seo.mjs:25` | yes |
| caminho sem barra final some | `lib/seo.mjs:24` | yes |
