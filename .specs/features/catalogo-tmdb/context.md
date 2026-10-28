# Catálogo TMDB Context

**Gathered:** 2026-10-27
**Spec:** `.specs/features/catalogo-tmdb/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Substituir a tabela `filmes` do experimento por um catálogo relacional do TMDB e gravar um seed idempotente de `data/tmdb/`. A home continua em `lib/filmes.ts`. Sem commits.

---

## Implementation Decisions

### Destino da tabela `filmes`

- O model do experimento sai. Tags, `url_midia` e `origem` não voltam.
- A home e o tipo em `lib/filmes.ts` ficam.

### Normalização

- Tabelas: filme, gênero, filme-gênero, coleção, pessoa, elenco, lista e posição.
- Empresas, países de origem, países de produção e idiomas falados ficam em JSON no filme.

### Agent's Discretion

- Nomes de coluna em português, com `@map` para o snake_case.
- Posição 1-based.
- Seed em uma transação que apaga e reinsere.
- `receita` como `bigint`.
- Mensagens de erro com slug/`20`, `elenco/{id}` e o id do gênero.

### Declined / Undiscussed Gray Areas → Assumptions

- Nenhuma área ficou sem registro. Auth, pagamento, TTL e observabilidade estão como N/A na spec.

---

## Specific References

Os JSON em `data/tmdb/`: `popular`, `now_playing`, `upcoming`, `top_rated`, `generos.json` e `elenco/{id}.json`.

---

## Deferred Ideas

- Trocar a home para o Prisma.
- Busca textual e página do experimento.
