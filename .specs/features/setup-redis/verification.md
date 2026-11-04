# setup-redis verification

**Verdict**: PASS
**Mutations**: 3 - probed C3, C10, C11
**Proofs**: `proofs.md` at 6f17a84
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| A linha da porta pode deixar de publicar o host e C3 continua verde | mutation `porta sai de ports e vira volume` not killed (`docker-compose.yml:24`). Sem a chave `ports`, `"6379:6379"` fica em `volumes` e RD-03 ainda casa a linha. | No RD-03, exigir `"6379:6379"` dentro do bloco `ports` do serviço `redis` | C3 |
| O `redis` exportado pode ignorar `REDIS_URL` e C10 continua verde | mutation `export ignora REDIS_URL` not killed (`lib/redis.ts:11`). O inicializador passa a `createClient({ url: "redis://localhost:1" })`. RD-10 segue verde porque `criarCliente` permanece no arquivo com `url: process.env.REDIS_URL`. | No RD-10, afirmar que o inicializador de `export const redis` é `criarCliente()` | C10 |
| Com `NODE_ENV=development` o cliente pode ficar fora de `globalThis` e C11 continua verde | mutation `development não guarda o cliente` not killed (`lib/redis.ts:13`). A condição ganha `&& process.env.NODE_ENV !== "development"`. RD-11 ainda acha `!== "production"` e `globalForRedis.redis = redis`. | No RD-11, exigir que o `if` que executa `globalForRedis.redis = redis` tenha a condição exatamente `process.env.NODE_ENV !== "production"` | C11 |
| README e PROJECT.md podem citar `Redis 80` ou `Redis 8.2` e C16 e C17 continuam verdes | Exemplo no texto atual: trocar `Redis 8` por `Redis 80`, `Redis 8.2` ou `Redis 81` deixa `includes("Redis 8")` verdadeiro em `tests/redis-docs.test.mjs:10` e `:15` | Exigir o token `Redis 8` sem dígito nem ponto logo em seguida, no README e no PROJECT.md | C16, C17 |
| `import("redis")` e `require("redis")` passam no RD-15 | O predicado em `tests/redis-cliente.test.mjs:48` marca `from "redis"` e `@/lib/redis`. `await import("redis")` e `require("redis")` ficam de fora | No RD-15, tratar `import(` e `require(` do pacote `redis` como import | C15 |
