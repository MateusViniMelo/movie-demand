# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)

## Shell & Command Reliability

## Domain Behavior Guardrails
1. **[2026-10-28] CSS solto some no build do Tailwind 4**
   Do instead: colocar regras próprias dentro de `@layer base` em `app/globals.css`. Fora da layer, `.page-gutter` não chega no CSS servido e o recuo fica 0.
2. **[2026-10-28] Contratos de fonte travam texto literal**
   Do instead: ao mudar copy da home, da duração ou dos títulos das fileiras, atualizar o `includes`/`indexOf` em `tests/home-fonte.test.mjs`, `tests/vitrine.test.mjs` e `tests/fileira-swiper.test.mjs`. Manter os regex do hero e o `slidePrev()` a 180 caracteres do rótulo.
3. **[2026-10-28] `useSearchParams` no hero suspende a vitrine**
   Do instead: com `cacheComponents`, gravar `?filme` e `?sinopse` com `History.prototype.replaceState`. O `replaceState` do Next refaz o GET da página. Não ler a query no servidor.
4. **[2026-10-27] Testes da home travam o hero e o pôster**
   Do instead: manter `from-black/85`, `leading-[0.95]`, `min-h-[78vh]`, `-mt-10`, o pôster só com `figure`/`div`/`Image`, e `slidePrev()` nos 180 caracteres antes do rótulo da seta.
5. **[2026-10-27] Com `cacheComponents`, a leitura do Postgres fica atrás de `Suspense`**
   Do instead: consultar o Prisma num componente filho, com fallback. Sem `use cache`, a query não entra no HTML estático.
6. **[2026-10-27] Next 16 trocou `priority` por `preload` no `next/image`**
   Do instead: no hero acima da dobra usar `preload={true}` só na imagem inicial. Nas trocas seguintes usar `loading="eager"`, sem combinar as duas props.
7. **[2026-10-27] Imagem do TMDB é caminho relativo, não URL**
   Do instead: montar `https://image.tmdb.org/t/p/{tamanho}{poster_path|backdrop_path}` (ex.: `w500` no poster, `w1280` no backdrop). O JSON já traz o path com barra inicial.
8. **[2026-10-27] `node prisma/seed.mjs` não carrega o client gerado do Prisma 7**
   Do instead: gravar o seed com `pg` e deixar o marcador `SPEC_DEVIATION`. `generated/prisma/client.ts` importa TypeScript sem extensão, e o Node não resolve isso.
9. **[2026-10-27] Detalhe de um filme é `GET /3/movie/{id}`**
   Do instead: usar o `id` da listagem, com `language=pt-BR`. Elenco, imagens e vídeos vão em `append_to_response`, não em chamadas soltas. A listagem não traz `runtime` nem nomes de gênero.
10. **[2026-10-21] `npm audit` das 9 altas é só `braces@3.0.3`**
   Do instead: não rodar `npm audit fix --force`. Não existe release corrigida de `braces`/`micromatch`/`fast-glob`; o force rebaixa `eslint-config-next` para 14 e `shadcn` para 1.0.

## User Directives
1. **[2026-10-28] Cartazes da fileira ocupam a largura da coluna**
   Do instead: não usar `slidesOffsetBefore` nem `slidesOffsetAfter`. A coluna continua `mx-auto w-full max-w-6xl`. As setas ficam a `0.5rem` da borda, sobre o pôster da ponta.
2. **[2026-10-27] As fileiras ficam numa coluna central**
   Do instead: envolver as fileiras em `mx-auto w-full max-w-6xl`. O hero continua de ponta a ponta.
3. **[2026-10-27] A home não repete a fileira Novidades**
   Do instead: não renderizar o destaque com `primeiroMaior`. Novidades entra só pelo `fileiras.map`.
4. **[2026-10-21] Responder sempre em português**
   Do instead: escrever toda resposta ao usuário em português.
5. **[2026-10-27] O hero é o cartaz grande, sem miniaturas**
   Do instead: gradiente da esquerda, fade `from-stage`, título `text-5xl sm:text-7xl` e `-mt-10` na faixa seguinte. A troca é automática, para com pausa ou `prefers-reduced-motion`, e as setas passam o filme.
