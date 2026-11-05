# Catálogo de filmes sob demanda

Aplicação Next.js do catálogo Cineverso. A raiz mostra os pôsteres do PostgreSQL.

A vitrine abre em tema escuro. O botão no canto troca para o tema claro e guarda a escolha neste navegador. No topo, a busca textual lista até cinco filmes enquanto se digita; Enter abre `/busca`. Cada linha da busca abre `/filme/{id}`.

O destaque da home é o carrossel de Filmes Populares, com título, sinopse e troca automática. Abaixo ficam Novidades, Mais bem avaliados e Filmes em Cartaz. Um clique num pôster dessas três fileiras abre a ficha e guarda o filme neste navegador. Na volta, a fileira Recomendações aparece na frente, com até doze pôsteres parecidos. A ficha em `/filme/{id}` mostra o still, o título e a mesma fileira para aquele filme.

A busca por metadados, o player e a página do experimento ainda não estão nesta entrega.

## Ambiente de desenvolvimento

Requisitos:

- Node.js 20 ou superior
- Docker em execução, com a porta `5432` livre para o PostgreSQL 17 e a porta `6379` livre para o Redis 8

Na raiz do repositório:

1. Copie `.env.example` para `.env` e deixe a `DATABASE_URL` e a `REDIS_URL` do container:

```
DATABASE_URL=postgresql://catalogo:catalogo@localhost:5432/catalogo
REDIS_URL=redis://localhost:6379
```

A origem pública é `NEXT_PUBLIC_SITE_URL`. Sem uma URL absoluta `http` ou `https`, a canônica, o Open Graph e o sitemap usam `http://localhost:3000`. No desenvolvimento local essa variável pode ficar comentada.

2. Instale as dependências e suba o PostgreSQL 17 e o Redis 8. O Redis 8 sobe no mesmo comando, sem senha. Nenhuma tela lê o Redis.

```bash
npm install
npm run db:up
```

3. Espere o Postgres aceitar conexão e aplique as migrações. Se o comando falhar logo após o container subir, rode de novo.

```bash
npx prisma migrate dev
```

4. Carregue o catálogo. O seed lê `data/tmdb` e grava filmes, gêneros, coleções, elenco, a URL do trailer e as listas. A home lê essas listas.

```bash
npm run db:seed
```

5. Inicie a aplicação:

```bash
npm run dev
```

A aplicação abre em [http://localhost:3000](http://localhost:3000).

Para parar o banco e o Redis: `npm run db:down`. Os volumes ficam no Docker, então o catálogo continua na próxima subida.

Conferir o lint e o build de produção:

```bash
npm run lint
npm run build
npm start
```
