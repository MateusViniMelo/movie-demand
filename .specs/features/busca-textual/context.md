# Busca textual Context

**Gathered:** 2026-10-28
**Spec:** `.specs/features/busca-textual/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Campo no topo, lista dos 5 primeiros debaixo do campo, e página `/busca` com o resultado paginado de 10. Sem ficha do filme e sem commits.

---

## Implementation Decisions

### Onde a pessoa busca

- Campo no topo.
- A busca corre a cada tecla, sem botão de envio.
- Debaixo do campo aparece a lista com os 5 primeiros.
- Cada item mostra título, gênero, duração e o banner.
- Enter, ou o botão `Busca completa` embaixo da lista, abre a página da busca.
- A página mostra o resultado paginado de 10.
- Palavras do pedido: "campo no topo com a busca sendo feito a cada tecla digitada (sem apertar botão ainda), e dps em baixo do campo aparece a lista com os 5 primeiros , com titulo genero e duração e o banner se a pessoa clicar enter ou clicar em baixo em um botão busca completa vai para a pagina da busca e mostra o restulado paginado de 10".

### O que o resultado mostra

- A pergunta sobre nota e tempo ficou respondida pelo formato acima.
- Palavras do pedido: "já respondi anteriormente".
- Nota e tempo não entram na tela.

### Agent's Discretion

- O intervalo curto entre teclas fica em 200 ms.
- O primeiro gênero é o de menor `generos.id`.
- O banner usa o backdrop; sem backdrop, o pôster; sem os dois, a linha segue sem imagem.

### Declined / Undiscussed Gray Areas → Assumptions

Nenhuma. O formato do resultado foi fechado no pedido.

---

## Specific References

Nenhuma captura. O visual segue o catálogo que já está na home: Barlow Condensed, paleta `stage`, vermelho da marca, faixa de banners largos.

---

## Deferred Ideas

- Página de um filme.
- Busca por gênero, tags ou duração.
- Página do experimento com nota, tempo e gabarito.
