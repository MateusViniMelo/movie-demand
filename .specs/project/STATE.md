# State

**Last Updated:** 2026-10-27
**Current Work:** Catálogo TMDB no PostgreSQL, com a home ainda em `lib/filmes.ts`

---

## Recent Decisions (Last 60 days)

### AD-001: O setup entra no app que já existe (2026-10-21)

**Decision:** A listagem fica em `movie-demand`, o Next.js 16 já criado.
**Reason:** O repositório já tem App Router, Tailwind 4 e shadcn. Recriar a pasta `catalogo` duplicaria o projeto.
**Trade-off:** O caminho do documento de setup (`catalogo/`) não é o diretório deste repositório.
**Impact:** PostgreSQL, `pg` e `.env.local` esperam a etapa do banco. Nada disso entra agora.

### AD-002: A primeira tela usa o recorte de 10 filmes (2026-10-21)

**Decision:** O array local repete as 10 fichas da seção 7 do experimento, com `origem` `real`.
**Reason:** Esse recorte já tem gênero, tags, duração e sinopse separados, que é a regra da comparação.
**Trade-off:** A tela não mostra os 50 filmes julgados nem as fichas sintéticas.
**Impact:** `lib/filmes.ts` é a fonte até existir consulta. `url_midia` fica no tipo e não é renderizada.

### AD-004: A vitrine segue a linguagem de um catálogo sob demanda (2026-10-21)

**Decision:** A raiz passou a ter destaque em tela cheia, fileiras horizontais por gênero, pôsteres originais e tema claro/escuro. O escuro abre por padrão.
**Reason:** A tela precisa parecer um catálogo para assistir, e o modelo continua sem capa oficial.
**Trade-off:** As imagens são ilustrações feitas para a demonstração, não pôsteres de estúdio, e não entram na coluna do banco.
**Impact:** Os arquivos ficam em `public/posters` e `public/capas`. A escolha de tema fica em `localStorage` (`tema`).

### AD-003: A listagem é uma etiqueta de lata, não uma grade de pôsteres (2026-10-21)

**Decision:** Cada ficha mostra número, gênero, título, sinopse, tags e a minutagem em mono (`113` vira `1:53`).
**Reason:** O modelo não tem imagem. A minutagem é o campo que a busca por duração vai usar.
**Trade-off:** A tela não parece um serviço de streaming.
**Impact:** Barlow Condensed nos títulos, Source Sans 3 na sinopse, IBM Plex Mono nos dados. O card não é link.

### AD-005: A consulta do banco passa pelo Prisma 7 (2026-10-21)

**Decision:** A consulta da aplicação passa pelo Prisma. O pacote `pg` fica só como driver do `@prisma/adapter-pg`.
**Reason:** O setup pedido usa Prisma no Postgres 17, no lugar do pool `pg` que ficava para a etapa do banco.
**Trade-off:** A busca textual, se o Prisma não cobrir o dicionário `portuguese`, fica para `$queryRaw` na etapa de medição.
**Impact:** `docker-compose.yml`, `prisma/schema.prisma` e `lib/prisma.ts`. A home continua em `lib/filmes.ts`. A forma da tabela e a carga vazia ficam substituídas por AD-006.

### AD-006: O catálogo TMDB substitui as colunas do experimento (2026-10-27)

**Decision:** Substituir as colunas do experimento pelo recorte de `data/tmdb`. Tags, `url_midia` e `origem` saem. Gênero, coleção, pessoa, elenco e a posição nas listas viram tabelas. Empresas, países e idiomas ficam em JSON. A home continua em `lib/filmes.ts`.
**Reason:** O JSON do TMDB não cabe na linha do experimento, e a vitrine local já está verificada.
**Trade-off:** O array de demonstração e a tabela do banco deixam de ter o mesmo formato.
**Impact:** `prisma/schema.prisma`, a migração `catalogo_tmdb` e `prisma/seed.mjs`. `npm run db:seed` grava o recorte.

---

## Active Blockers

Nenhum.

---

## Lessons Learned

### L-001: CSS do Tailwind preso no cache do dev (2026-10-21)

**Context:** A home passou a usar tokens novos em `globals.css` com o `next dev` já aberto.
**Problem:** O HTML novo chegou, e o CSS servido continuou com Geist e sem `bg-shelf`, mesmo depois de reiniciar o processo.
**Solution:** Apagar `.next` e subir o dev de novo. Aí Barlow Condensed, Source Sans 3, IBM Plex Mono e as cores da estante entraram.
**Prevents:** Concluir que o tema falhou antes de descartar o cache do Turbopack.

---

## Quick Tasks Completed

| #   | Description | Date | Commit | Status |
| --- | ----------- | ---- | ------ | ------ |

---

## Deferred Ideas

- [ ] Trocar o array local pela consulta ao PostgreSQL — Captured during: listagem de filmes
- [ ] Abrir a ficha com o player nativo — Captured during: listagem de filmes

---

## Todos

- [x] Conferir a listagem no navegador e marcar a feature como verificada
