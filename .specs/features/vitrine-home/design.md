# Vitrine da home

## Architecture

A página continua servidora. A leitura do banco fica atrás de `Suspense`, porque `cacheComponents` está ligado e a consulta não usa `use cache`. O módulo puro monta destaque e fileiras. O Prisma só busca as linhas.

```
app/page.tsx --> carregarVitrine
carregarVitrine --> prisma.listaFilme
carregarVitrine --> montarVitrine
montarVitrine --> Fileira
```

## Components

| Component | Responsibility |
| --- | --- |
| `lib/cartaz.mjs` | `urlDoPoster` e `montarVitrine`. Sem Prisma, para o `node --test` importar. |
| `lib/vitrine.ts` | `carregarVitrine` lê `listaFilme` com `posicao` e chama `montarVitrine`. |
| `components/fileira.tsx` | Swiper existente. Com `primeiroMaior`, o primeiro slide usa `w-[14rem]` e `sm:w-[22rem]`. |
| `components/poster.tsx` | Só a imagem. `alt` é o título. `src` já vem com o tamanho. |
| `app/page.tsx` | `Topo` no shell. `Suspense` com `Carregando o catálogo.` O destaque é a fileira `Novidades` com `primeiroMaior`. Abaixo, as quatro fileiras. |

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Imagem | `next/image` com `remotePatterns` em `image.tmdb.org` e pathname `/t/p/**` | A doc desta versão do Next bloqueia host externo sem isso |
| Consulta | Prisma na página, função pura no teste | O alias `@/` não carrega no `node --test` |
| Hero antigo | Sai da página | O destaque novo é o carrossel de pôsteres |
