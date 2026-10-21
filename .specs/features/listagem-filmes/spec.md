# Listagem de filmes

## Problem Statement

A demonstração precisa de um catálogo visível antes do banco e das buscas. Sem essa tela, não há onde conferir se título, sinopse, gênero, tags e duração estão separados do jeito que o experimento exige.

## Goals

- [x] A raiz lista as 10 fichas de exemplo com os campos que a pessoa lê
- [x] O dado local tem o mesmo formato da linha de filme, inclusive `url_midia` e `origem`

## Out of Scope

| Feature | Reason |
| --- | --- |
| PostgreSQL, `pg` e `.env.local` | O pedido desta entrega é só o front |
| Busca textual e busca por metadados | Dependem do banco e da medição |
| Página do experimento | Mostra duas colunas, nota e gabarito |
| Ficha e player | `url_midia` fica guardada para essa etapa |
| Pôster ou capa | O modelo não tem imagem |

---

## User Stories

### P1: Ver as fichas da demonstração ⭐ MVP

**User Story**: Como quem apresenta o experimento, quero ver o catálogo de demonstração para conferir título, sinopse, gênero, tags e duração de cada filme.

**Why P1**: É a única tela desta entrega e o lugar onde o formato do dado fica visível.

**Acceptance Criteria**:

1. WHEN a pessoa abre a raiz THEN o sistema SHALL listar as 10 fichas de `lib/filmes.ts`, em ordem de `id`.
2. WHEN uma ficha é exibida THEN o sistema SHALL mostrar o número de catálogo, o gênero por extenso, o título, a sinopse, as tags como estão no vocabulário e a duração em horas e minutos.
3. WHEN uma ficha é exibida THEN o sistema SHALL omitir `url_midia` e `origem`.
4. WHEN o array de filmes está vazio THEN o sistema SHALL mostrar “Nenhuma ficha neste catálogo.”
5. WHEN a largura é de celular, tablet ou desktop THEN o sistema SHALL usar uma, duas ou três colunas.

**Independent Test**: Abrir `http://localhost:3000` e ler Central do Brasil (`1:53`, Drama, tags `brasil`, `estrada`, `familia`) até Divertida Mente.

---

## Edge Cases

- WHEN o gênero não está no mapa Drama, Ficção ou Animação THEN o sistema SHALL mostrar o valor guardado.
- WHEN a duração é 0 THEN o sistema SHALL mostrar `0:00`.
- WHEN a ficha não tem tags THEN o sistema SHALL omitir a lista de tags.
- WHEN não há filmes THEN o cabeçalho SHALL mostrar “0 fichas” e a mensagem de lista vazia.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| LST-01 | P1: Ver as fichas da demonstração | Execute | Verified |
| LST-02 | P1: Ver as fichas da demonstração | Execute | Verified |
| LST-03 | P1: Ver as fichas da demonstração | Execute | Verified |
| LST-04 | P1: Ver as fichas da demonstração | Execute | Verified |
| LST-05 | P1: Ver as fichas da demonstração | Execute | Verified |

**ID format:** `LST-[NUMBER]`

**Coverage:** 5 total, 5 mapped to this delivery, 0 unmapped

---

## Success Criteria

- [x] As 10 fichas do recorte aparecem na raiz, em português
- [x] Nenhum card é link e nenhum endereço de mídia aparece
- [x] A grade responde a uma, duas e três colunas
