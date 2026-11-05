# Recomendações na home

**Approved**: 2026-11-05 - user: "Implement the plan as specified"

## Problem Statement

A home mostra as fileiras do catálogo e não guarda o filme que a pessoa acabou de abrir. A fileira Recomendações precisa aparecer na volta à home, calculada só a partir do último pôster clicado em Novidades, Mais bem avaliados ou Filmes em Cartaz, e permanecer neste navegador até o próximo clique.

## Goals

- [x] A home mostra a fileira Recomendações acima de Novidades, Mais bem avaliados e Filmes em Cartaz quando há filme relevante
- [x] O clique nessas três fileiras continua abrindo `/filme/{id}` e substitui o filme guardado no navegador
- [x] A lista tem no máximo 12 filmes, ordenados pela nota de gênero, coleção e elenco

## Out of Scope

| Feature | Reason |
| --- | --- |
| Conta de usuário | O plano guarda o último filme só neste navegador |
| Soma de vários cliques, dispensar e peso por revisita | O plano usa apenas o último filme clicado |
| Clique no hero ou na fileira Recomendações como origem | O plano limita a origem às três fileiras de baixo |
| Fileira Filmes Populares | A home já não a renderiza |
| Prazo de expiração | O valor fica até o próximo clique ou até a pessoa limpar os dados do site |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Chave | `cineverso.recomendacao` com o texto `{"versao":1,"filmeId":id}` | O plano aprovado | y |
| Título da fileira | `Recomendações` | O plano nomeia essa fileira | y |
| Teto e desempate | 12 filmes; nota, `votos`, `notaMedia`, `id` crescente | O plano aprovado | y |
| Gênero | Conjunto de `generoId`; cada gênero da origem pesa `1/quantidade` | Ids repetidos não aumentam o peso | y |
| Coleção | `0.3` só quando os dois `colecaoId` são não nulos e iguais | Nulo não é coleção, nem nulo com nulo | y |
| Elenco | `0.15` se cruzar algum dos 5 `pessoaId` de menor `ordem` | Empate de ordem desempata por `pessoaId` crescente; a menor ordem da pessoa prevalece | y |
| Pôster | Candidato com `posterPath` nulo ou `""` fica de fora; `src` é `w500` | A fileira só desenha pôster, como a vitrine | y |
| Resposta vazia ou falha | Sem fileira; id inválido ou filme ausente responde 404; leitura que lança responde 500 | A home só desenha a fileira com status 200 e ao menos um filme | y |
| Enquanto carrega | Nenhum pôster de recomendação | O plano não pede texto de espera | y |
| Outra aba | O evento `storage` dessa chave relê o valor | O plano pede a home aberta atualizada | y |
| Demais dimensões | N/A para este escopo | Não há auth, pagamento, TTL nem fila de escrita | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Fileira a partir do último filme ⭐ MVP

**User Story**: Como quem abre um filme nas fileiras de baixo, quero ver na home, ao voltar, filmes parecidos com esse último clique.

**Why P1**: Sem a fileira e sem o clique, a home não recomenda.

**Acceptance Criteria**:

1. WHEN a pessoa aciona um pôster de Novidades, Mais bem avaliados ou Filmes em Cartaz THEN the system SHALL gravar na chave `cineverso.recomendacao` o texto `{"versao":1,"filmeId":<id>}`, substituindo o valor anterior.
2. IF a gravação dessa chave lança erro THEN the system SHALL concluir o acionamento sem lançar esse erro.
3. WHEN o valor guardado está ausente, não é esse JSON, tem `versao` diferente de 1, ou tem `filmeId` que `idDoFilme` rejeita THEN the system SHALL tratar o filme guardado como ausente.
4. The system SHALL gravar o clique nos títulos Novidades, Mais bem avaliados e Filmes em Cartaz, e SHALL NOT gravar o clique em Filmes Populares, em Recomendações nem no hero.
5. WHEN a home tem um filme guardado THEN the system SHALL pedir `GET /api/recomendacoes?filme={id}`.
6. WHILE a resposta desse pedido não chegou the system SHALL mostrar nenhum pôster de recomendação.
7. IF o status da resposta não é 200 THEN the system SHALL mostrar nenhuma fileira Recomendações.
8. WHEN o status é 200 e `filmes` está vazio THEN the system SHALL mostrar nenhuma fileira Recomendações.
9. WHEN o status é 200 e `filmes` tem itens THEN the system SHALL mostrar a fileira titulada `Recomendações` antes de Novidades, Mais bem avaliados e Filmes em Cartaz.
10. WHEN a pessoa aciona um pôster da fileira Recomendações THEN the system SHALL abrir `/filme/{id}` desse pôster sem gravar `cineverso.recomendacao`.
11. WHEN um evento `storage` traz a chave `cineverso.recomendacao` THEN the system SHALL ler de novo o filme guardado.
12. WHEN um evento `storage` traz outra chave THEN the system SHALL ignorá-lo.
13. WHEN a origem tem os gêneros `1` e `2` e o candidato tem `1`, `1` e `3` THEN the system SHALL calcular a parte de gênero como `0.25`.
14. WHEN a origem ou o candidato não tem gênero THEN the system SHALL usar `0` na parte de gênero.
15. WHEN os dois `colecaoId` são não nulos e iguais THEN the system SHALL somar `0.3`.
16. WHEN algum `colecaoId` é nulo THEN the system SHALL somar `0` de coleção.
17. WHEN a interseção dos até 5 `pessoaId` de menor `ordem` não é vazia THEN the system SHALL somar `0.15`.
18. WHEN essa interseção é vazia THEN the system SHALL somar `0` de elenco.
19. The system SHALL montar cada conjunto de elenco com um `pessoaId`, na menor `ordem`, ordenado por `ordem` crescente e `pessoaId` crescente, limitado a 5.
20. IF a soma das três partes é `0` ou os filmes não compartilham gênero nem coleção THEN the system SHALL excluir o candidato.
21. The system SHALL excluir da lista o id do filme de origem.
22. IF `posterPath` é nulo ou `""` THEN the system SHALL excluir o candidato.
23. WHEN mais de 12 candidatos passam THEN the system SHALL devolver 12, ordenados pela nota decrescente, `votos` decrescente, `notaMedia` decrescente e `id` crescente.
24. IF o parâmetro `filme` não passa em `idDoFilme` THEN `GET /api/recomendacoes` SHALL responder 404.
25. IF nenhum filme do catálogo tem esse id THEN `GET /api/recomendacoes` SHALL responder 404.
26. WHEN o filme existe e nenhum candidato passa THEN `GET /api/recomendacoes` SHALL responder 200 com corpo `{ "filmes": [] }`.
27. WHEN há candidatos THEN the system SHALL devolver cada item com `id`, `titulo` e `src` igual a `https://image.tmdb.org/t/p/w500` seguido de `posterPath`, nessa ordem, com no máximo 12.
28. IF a leitura do catálogo lança erro THEN `GET /api/recomendacoes` SHALL responder 500.
29. IF a leitura do `localStorage` lança erro THEN the system SHALL mostrar nenhuma fileira Recomendações.

**Independent Test**: Na home, acionar um pôster de Novidades, abrir a ficha, voltar e ver a fileira Recomendações. Sem clique prévio, a fileira não aparece.

---

## Edge Cases

- `filmeId` `0`, `2147483648` e `versao` `2` contam como ausência (AC 3).
- `colecaoId` nulo com nulo soma `0` (AC 16).
- O sexto nome do elenco e um `pessoaId` fora dos 5 menores não somam `0.15` (AC 18, AC 19).
- Elenco em comum, sem gênero em comum e sem a mesma coleção, fica de fora (AC 20).
- `posterPath` `""` fica de fora (AC 22).
- O 13º candidato, pelo `id` crescente quando o resto empata, fica de fora (AC 23).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| REC-01 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-02 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-03 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-04 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-05 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-06 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-07 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-08 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-09 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-10 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-11 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-12 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-13 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-14 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-15 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-16 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-17 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-18 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-19 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-20 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-21 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-22 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-23 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-24 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-25 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-26 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-27 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-28 | P1: Fileira a partir do último filme | Execute | Verified |
| REC-29 | P1: Fileira a partir do último filme | Execute | Verified |

**Coverage:** 29 total, 29 mapped to checks, 0 unmapped

---

## Sources

- Plano aprovado: fileira Recomendações acima das três fileiras, último clique, `localStorage`, nota de gênero, coleção e elenco

---

## Success Criteria

- [x] Um pôster de Novidades abre a ficha e, na volta, a home mostra Recomendações
- [x] Sem filme guardado, essa fileira não aparece
- [x] O hero e a própria fileira Recomendações não trocam o filme guardado
