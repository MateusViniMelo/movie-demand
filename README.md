# Catálogo de filmes sob demanda

Aplicação Next.js para o experimento de busca textual e busca por metadados. A raiz mostra os pôsteres do PostgreSQL.

A vitrine abre em tema escuro. O botão no canto troca para o tema claro e guarda a escolha neste navegador. No topo, Novidades abre com o primeiro pôster maior. Abaixo ficam Filmes Populares, Novidades, Filmes Bem avaliados e Filmes em Cartaz.

As duas buscas, a ficha com player e a página do experimento ainda não estão nesta entrega. O Postgres 17 e o Prisma já ficam disponíveis em local.

## Rodar

Requisito: Node.js 20 ou superior.

```powershell
npm install
npm run dev
```

A aplicação abre em [http://localhost:3000](http://localhost:3000).

## Banco local

PostgreSQL 17 sobe no Docker Compose. Copie `.env.example` para `.env`.

```powershell
npm run db:up
npx prisma migrate dev
npm run db:seed
```

O seed lê `data/tmdb` e grava filmes, gêneros, coleções, elenco e as listas. A home lê essas listas.

Conferir o lint e o build de produção:

```powershell
npm run lint
npm run build
npm start
```
