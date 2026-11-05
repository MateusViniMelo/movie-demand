# Recomendações

Entry: `components/recomendacoes.tsx:Recomendacoes()`

Home (`app/page.tsx`): sem prop. Lê `cineverso.recomendacao` com `lib/recomendacoes.mjs:lerArmazenamento()`. Evento `storage` dessa chave recarrega.

Ficha (`app/filme/[id]/page.tsx`): `filmeId` da rota. A fileira é desse filme. Sem listener de `storage`.

Pedido: `GET /api/recomendacoes?filme={id}` via `pedidoSeHouver()`. Lista vazia ou status ≠ 200 não desenha a fileira.

Clique no pôster da fileira abre `/filme/{id}` e não chama `registrarClique`. Só Novidades, Mais bem avaliados e Filmes em Cartaz gravam (`gravaEscolha`).

Faixa da ficha: classe `faixa-ficha` em `app/globals.css`. O traço e o respiro só aparecem quando a fileira renderiza `section`.

Testes de UI comparam o texto-fonte, não o DOM.

Updated: 2026-11-05
