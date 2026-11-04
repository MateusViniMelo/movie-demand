# setup-redis proofs

**HEAD**: 6f17a84
**Tree**: dirty - .env.example, README.md, docker-compose.yml, package-lock.json, package.json
**Result**: 24 pass, 0 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `node --test --test-name-pattern "RD-01" tests/compose-contrato.test.mjs` | count unknown | - | pass |
| C2 | `node --test --test-name-pattern "RD-02" tests/redis-compose.test.mjs` | count unknown | - | pass |
| C3 | `node --test --test-name-pattern "RD-03" tests/redis-compose.test.mjs` | count unknown | - | pass |
| C4 | `node --test --test-name-pattern "RD-04" tests/redis-compose.test.mjs` | count unknown | - | pass |
| C5 | `node --test --test-name-pattern "RD-05" tests/redis-compose.test.mjs` | count unknown | - | pass |
| C6 | `node --test --test-name-pattern "RD-06" tests/redis-compose.test.mjs` | count unknown | - | pass |
| C7 | `node --test --test-name-pattern "RD-07" tests/redis-compose.test.mjs` | count unknown | - | pass |
| C8 | `node --test --test-name-pattern "RD-08" tests/redis-env.test.mjs` | count unknown | - | pass |
| C9 | `node --test --test-name-pattern "RD-09" tests/redis-env.test.mjs` | count unknown | - | pass |
| C10 | `node --test --test-name-pattern "RD-10" tests/redis-cliente.test.mjs` | count unknown | - | pass |
| C11 | `node --test --test-name-pattern "RD-11" tests/redis-cliente.test.mjs` | count unknown | - | pass |
| C12 | `node --test --test-name-pattern "RD-12" tests/redis-cliente.test.mjs` | count unknown | - | pass |
| C13 | `node --test --test-name-pattern "RD-13" tests/redis-cliente.test.mjs` | count unknown | - | pass |
| C14 | `node --test --test-name-pattern "RD-14" tests/redis-cliente.test.mjs` | count unknown | - | pass |
| C15 | `node --test --test-name-pattern "RD-15" tests/redis-cliente.test.mjs` | count unknown | - | pass |
| C16 | `node --test --test-name-pattern "RD-16" tests/redis-docs.test.mjs` | count unknown | - | pass |
| C17 | `node --test --test-name-pattern "RD-17" tests/redis-docs.test.mjs` | count unknown | - | pass |
| C18 | `node --test --test-name-pattern "RD-18" tests/redis-docs.test.mjs` | count unknown | - | pass |
| C19 | `node --test --test-name-pattern "RD-19" tests/redis-ping.test.mjs` | count unknown | - | pass |
| C20 | `node --test --test-name-pattern "RD-20" tests/redis-ping.test.mjs` | count unknown | - | pass |
| C21 | `node --test --test-name-pattern "RD-21" tests/redis-ping.test.mjs` | count unknown | - | pass |
| Build | `npm run lint` | - | - | pass |
| Build | `node --test` | - | - | pass |
| Build | `npm run build` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| porta sai de ports e vira volume | `docker-compose.yml:24` | yes |
| export ignora REDIS_URL | `lib/redis.ts:11` | yes |
| development não guarda o cliente | `lib/redis.ts:13` | yes |
