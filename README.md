# Catálogo de filmes sob demanda

Aplicação Next.js para o experimento de busca textual e busca por metadados. A raiz mostra os pôsteres do PostgreSQL.

A vitrine abre em tema escuro. O botão no canto troca para o tema claro e guarda a escolha neste navegador. No topo, a busca textual lista até cinco filmes enquanto se digita; Enter abre `/busca`. Novidades abre com o primeiro pôster maior. Abaixo ficam Filmes Populares, Novidades, Filmes Bem avaliados e Filmes em Cartaz.

A busca por metadados, a ficha com player e a página do experimento ainda não estão nesta entrega.

## Ambiente de desenvolvimento

Requisito: Node.js 20 ou superior.

O banco de desenvolvimento é o PostgreSQL 17 do Docker Compose. O Redis 8 sobe no mesmo comando, sem senha. Copie `.env.example` para `.env` e deixe a `DATABASE_URL` e a `REDIS_URL` do container:

```
DATABASE_URL=postgresql://catalogo:catalogo@localhost:5432/catalogo
REDIS_URL=redis://localhost:6379
```

```bash
npm install
npm run db:up
npx prisma migrate dev
npm run db:seed
npm run dev
```

A aplicação abre em [http://localhost:3000](http://localhost:3000).

A origem pública é `NEXT_PUBLIC_SITE_URL`. Sem uma URL absoluta `http` ou `https`, a canônica, o Open Graph e o sitemap usam `http://localhost:3000`.

O seed lê `data/tmdb` e grava filmes, gêneros, coleções, elenco e as listas. A home lê essas listas.

Para parar o banco: `npm run db:down`.

Conferir o lint e o build de produção:

```bash
npm run lint
npm run build
npm start
```
