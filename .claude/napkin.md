# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)

## Shell & Command Reliability

## Domain Behavior Guardrails
1. **[2026-10-27] Com `cacheComponents`, a leitura do Postgres fica atrás de `Suspense`**
   Do instead: consultar o Prisma num componente filho, com fallback. Sem `use cache`, a query não entra no HTML estático.
2. **[2026-10-27] `node prisma/seed.mjs` não carrega o client gerado do Prisma 7**
   Do instead: gravar o seed com `pg` e deixar o marcador `SPEC_DEVIATION`. `generated/prisma/client.ts` importa TypeScript sem extensão, e o Node não resolve isso.
2. **[2026-10-27] Detalhe de um filme é `GET /3/movie/{id}`**
   Do instead: usar o `id` da listagem, com `language=pt-BR`. Elenco, imagens e vídeos vão em `append_to_response`, não em chamadas soltas. A listagem não traz `runtime` nem nomes de gênero.
2. **[2026-10-27] Imagem do TMDB é caminho relativo, não URL**
   Do instead: montar `https://image.tmdb.org/t/p/{tamanho}{poster_path|backdrop_path}` (ex.: `w500` no poster, `w1280` no backdrop). O JSON já traz o path com barra inicial.
3. **[2026-10-21] `npm audit` das 9 altas é só `braces@3.0.3`**
   Do instead: não rodar `npm audit fix --force`. Não existe release corrigida de `braces`/`micromatch`/`fast-glob`; o force rebaixa `eslint-config-next` para 14 e `shadcn` para 1.0.

## User Directives
1. **[2026-10-21] Responder sempre em português**
   Do instead: escrever toda resposta ao usuário em português.
