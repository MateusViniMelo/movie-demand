# Catálogo de filmes sob demanda

Aplicação Next.js para o experimento de busca textual e busca por metadados. Nesta etapa a raiz mostra o catálogo de demonstração, com dados locais.

A vitrine abre em tema escuro. O botão no canto troca para o tema claro e guarda a escolha neste navegador. O destaque é Central do Brasil. Abaixo ficam as fileiras Drama, Ficção e Animação, cada uma com pôster, título, gênero e duração.

Os dez filmes estão em `lib/filmes.ts`, no formato da linha do banco: `id`, `titulo`, `descricao`, `genero`, `duracao_min`, `url_midia`, `origem` e `tags`. As imagens em `public/posters` e `public/capas` são ilustrações da demonstração. O endereço de mídia fica no dado e não entra na tela.

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

O seed lê `data/tmdb` e grava filmes, gêneros, coleções, elenco e as listas. A home continua lendo `lib/filmes.ts`.

Conferir o lint e o build de produção:

```powershell
npm run lint
npm run build
npm start
```
