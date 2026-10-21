# Catálogo de filmes sob demanda

Aplicação Next.js para o experimento de busca textual e busca por metadados. Nesta etapa a raiz mostra o catálogo de demonstração, com dados locais.

A vitrine abre em tema escuro. O botão no canto troca para o tema claro e guarda a escolha neste navegador. O destaque é Central do Brasil. Abaixo ficam as fileiras Drama, Ficção e Animação, cada uma com pôster, título, gênero e duração.

Os dez filmes estão em `lib/filmes.ts`, no formato da linha do banco: `id`, `titulo`, `descricao`, `genero`, `duracao_min`, `url_midia`, `origem` e `tags`. As imagens em `public/posters` e `public/capas` são ilustrações da demonstração. O endereço de mídia fica no dado e não entra na tela.

PostgreSQL, as duas buscas, a ficha com player e a página do experimento ainda não estão nesta entrega.

## Rodar

Requisito: Node.js 20 ou superior.

```powershell
npm install
npm run dev
```

A aplicação abre em [http://localhost:3000](http://localhost:3000).

Conferir o lint e o build de produção:

```powershell
npm run lint
npm run build
npm start
```
