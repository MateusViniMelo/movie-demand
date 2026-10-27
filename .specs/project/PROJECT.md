# Catálogo de filmes sob demanda

**Vision:** Um catálogo Next.js em que a mesma aplicação mostra filmes e, depois, compara busca textual com busca por metadados.
**For:** Quem apresenta e avalia o experimento de sistemas multimídia.
**Solves:** Recuperar o mesmo filme por título e descrição ou por gênero, tags e duração, com o tempo medido no servidor.

## Goals

- Abrir a raiz e ver as fichas de demonstração com título, sinopse, gênero, tags e duração.
- Manter o dado de cada filme no formato das colunas do banco, para a listagem trocar o array local pelo PostgreSQL sem redesenhar a ficha.

## Tech Stack

**Core:**

- Framework: Next.js 16.4.2 (App Router, `cacheComponents` e `partialPrefetching`)
- Language: TypeScript
- UI: React 19, Tailwind CSS 4
- Database: PostgreSQL 17 no Docker Compose, com Prisma 7

**Key dependencies:** Prisma 7 para a consulta. `pg` entra só como driver do adapter. shadcn já está no projeto e esta tela não depende dele.

## Scope

**v1 includes:**

- Listagem das fichas de demonstração
- Ficha do filme com player nativo
- Carga do catálogo no PostgreSQL
- Busca textual e busca por metadados, cada uma devolvendo nota e tempo
- Página do experimento com uma necessidade por vez

**Explicitly out of scope:**

- Conta de usuário, recomendação e personalização
- Julgamento de relevância feito na hora da apresentação
- Arquivo de vídeo dentro do banco

## Constraints

- Timeline: a primeira tela é só o front, com dados locais
- Technical: Node.js 20 ou superior; gênero, tags e duração não entram no título nem na descrição
- Resources: o dicionário `portuguese` do PostgreSQL fica para a etapa da busca
