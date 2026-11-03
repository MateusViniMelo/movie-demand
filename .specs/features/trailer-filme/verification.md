# trailer-filme verification

**Verdict**: PASS
**Mutations**: 3 - probed C2, C5, C7
**Proofs**: `proofs.md` at 1ad375e
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| A migração pode gravar `varchar(32)` NOT NULL e C2 continua verde | mutation `coluna da migração vira varchar NOT NULL` not killed (`prisma/migrations/20261103104300_trailer_filme/migration.sql:1`). TRL-02 lê `information_schema` do banco já migrado. | No TRL-02, afirmar que `prisma/migrations/20261103104300_trailer_filme/migration.sql` contém `ADD COLUMN "trailer_url" TEXT` e não contém `NOT NULL` | C9 |
| O seed pode trocar o texto do JSON nos outros 69 filmes e C7 continua verde | mutation `URL dos outros filmes vira prefixo fixo` not killed (`prisma/seed.mjs:164`). O valor fixo ainda começa com `https://www.youtube.com/watch?v=`. TRL-03 e TRL-04 travam só os filmes `969681` e `155`. | Afirmar que cada `filmes.trailer_url` é o texto de `trailer_url` no JSON, num id fora de `969681`, `155` e `1770234` | C10 |
| Chave ausente pode virar string vazia e C5 continua verde | mutation `chave ausente vira string vazia` not killed (`prisma/seed.mjs:164`). TRL-05 só cobre o JSON `null` do filme `1770234`. Em HEAD, o filme `1058424` sem a chave grava NULL, e uma URL de 2536 caracteres no filme `1232569` volta inteira. | Semear um filme sem a chave `trailer_url` e afirmar `trailer_url` NULL | C11 |
