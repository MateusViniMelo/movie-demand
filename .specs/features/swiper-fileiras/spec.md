# Swiper nas fileiras de gênero

## Problem Statement

As fileiras de Drama, Ficção e Animação rolam com scroll nativo e botões próprios. O catálogo precisa do Swiper nessas fileiras, com o mesmo pôster, o mesmo título e as mesmas setas, para o grupo visível andar junto.

## Goals

- [x] A raiz mostra as três fileiras dentro do Swiper
- [x] As setas movem o grupo visível e param na extremidade
- [x] `prefers-reduced-motion: reduce` troca a posição sem animação

## Out of Scope

| Feature | Reason |
| --- | --- |
| Hero em carrossel | O destaque continua um filme só |
| Loop, autoplay, paginação e coverflow | A fileira atual para nas pontas e não avança sozinha |
| Carrossel do shadcn | Esta entrega usa o pacote `swiper` |
| Troca da fonte `lib/filmes.ts` | A home continua no recorte local |
| Commits | O pedido desta entrega não inclui commit |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Onde o Swiper entra | Substitui o scroll de `components/fileira.tsx` | É o único slide da home; a página já monta as três fileiras | y |
| Quantos pôsteres andam por clique | `slidesPerView: "auto"` e `slidesPerGroupAuto` | A largura do pôster muda entre celular e `sm`; o grupo visível é o equivalente do recuo de 85% da fileira | y |
| Movimento reduzido | `speed: 0` depois da hidratação | O componente é client e não pode ler `window` no SSR | y |
| Lista vazia | A fileira não renderiza seção | O componente já retorna `null` quando `filmes.length === 0` | y |
| Marcação da lista | `wrapperTag="ul"` e `SwiperSlide` como `li` | O pôster deixa de ser o `li` para não aninhar duas listas | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Fileiras no Swiper ⭐ MVP

**User Story**: Como quem vê o catálogo, quero as fileiras de gênero em um slide para percorrer os pôsteres com as setas e com o arraste.

**Why P1**: É a tela inteira desta entrega.

**Acceptance Criteria**:

1. WHEN a pessoa abre a raiz THEN o sistema SHALL mostrar as fileiras Drama, Ficção e Animação com os pôsteres do gênero dentro de um Swiper.
2. WHEN a pessoa aciona o botão da direita ou da esquerda THEN o sistema SHALL mover o grupo visível nessa direção e parar na extremidade.
3. WHILE `prefers-reduced-motion: reduce` o sistema SHALL trocar a posição da fileira sem animação.
4. IF a fileira não tem filmes THEN o sistema SHALL não renderizar essa seção.
5. The sistema SHALL manter o título da fileira e os rótulos `Rolar ${titulo} para a esquerda` e `Rolar ${titulo} para a direita`.

**Independent Test**: Abrir `http://localhost:3000`, ver as três fileiras e acionar as setas até a extremidade. `node --test tests/fileira-swiper.test.mjs` confere o contrato do componente.

---

## Edge Cases

- WHEN todos os pôsteres cabem na largura THEN o sistema SHALL manter as setas sem criar loop.
- WHEN a largura é de celular THEN o sistema SHALL usar pôster de `7.75rem`, espaço de `8px` e recuo de `16px`.
- WHEN a largura é de `640px` ou mais THEN o sistema SHALL usar pôster de `11rem`, espaço de `12px` e recuo de `48px`.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SWP-01 | P1: Fileiras no Swiper | Execute | Verified |
| SWP-02 | P1: Fileiras no Swiper | Execute | Verified |
| SWP-03 | P1: Fileiras no Swiper | Execute | Verified |
| SWP-04 | P1: Fileiras no Swiper | Execute | Verified |
| SWP-05 | P1: Fileiras no Swiper | Execute | Verified |

**ID format:** `SWP-[NUMBER]`

**Coverage:** 5 total, 5 mapped to this delivery, 0 unmapped

---

## Success Criteria

- [x] As três fileiras da raiz usam Swiper e os pôsteres do gênero
- [x] As setas movem o grupo visível e param na ponta
- [x] Movimento reduzido não anima a troca
