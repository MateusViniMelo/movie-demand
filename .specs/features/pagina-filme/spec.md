# Página do filme

**Approved**: 2026-11-05 - user: "Implement the plan as specified"

## Problem Statement

A vitrine, o hero e a busca mostram filmes que não abrem em lugar nenhum. A pessoa precisa de uma página por filme. Nesta versão a página é o still desse filme e o título, e nada mais da ficha.

## Goals

- [x] Um clique no pôster, no título do hero ou numa linha da busca abre `/filme/{id}`
- [x] A página mostra o backdrop desse filme, ou o pôster se o backdrop falta, e o título como único `h1`
- [x] Um id que não é um filme do catálogo responde não encontrado

## Out of Scope

| Feature | Reason |
| --- | --- |
| Sinopse, gênero, duração, elenco, nota, trailer e player | O plano limita a página ao still e ao título |
| Cada filme no sitemap ou JSON-LD novo | O plano deixa o sitemap como está |
| Cache no Redis | Nenhuma tela lê o Redis |
| Página ilustrada de erro | O não encontrado do Next basta |
| Bloco Voltar | A marca do Topo já volta para `/` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Id na URL | Inteiro de 1 a 2147483647, sem zero à esquerda, a chave `filmes.id` | A coluna é `Int` do PostgreSQL. Acima disso a consulta estoura em vez de responder não encontrado | y |
| Fundo | Backdrop em `w1280`; caminho nulo ou vazio cai no pôster no mesmo tamanho; sem os dois, sem imagem | O plano aprovado | y |
| Título sobre o still | Mesma posição, degradê e `font-display` do hero da home, em branco | O plano pede o hero existente, só com o título | y |
| Chrome | `Topo` da home; sem `Voltar` | A marca já volta para `/` | y |
| Carregando | O texto `Carregando o filme…` dentro de `Suspense` | `cacheComponents` exige o fallback na leitura de `params` e do banco | y |
| Título do documento | O segmento é o `titulo`; o template da raiz produz `{titulo} — Cineverso` | A busca já usa esse template | y |
| Linhas da busca | Cada linha aponta para `/filme/{id}` | O plano substitui a regra da busca textual que proibia href de ficha | y |
| Controles do hero | Continuam botões; só o título do slide é link | O plano limita o clique do hero ao título | y |
| Demais dimensões | N/A para este escopo | Não há auth, pagamento, TTL nem escrita concorrente | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Abrir o filme no still ⭐ MVP

**User Story**: Como quem escolhe um filme na vitrine, no hero ou na busca, quero abrir a página dele e ver o still com o título.

**Why P1**: Sem o clique e sem a página, o catálogo não tem ficha.

**Acceptance Criteria**:

1. WHEN a pessoa aciona o pôster de uma fileira THEN the system SHALL abrir `/filme/{id}` desse pôster.
2. WHEN a pessoa aciona o título do slide atual do hero THEN the system SHALL abrir `/filme/{id}` desse slide.
3. WHEN a pessoa aciona uma linha da busca no painel ou em `/busca` THEN the system SHALL abrir `/filme/{id}` dessa linha.
4. WHEN `/filme/{id}` é um filme com `backdropPath` não vazio THEN the system SHALL mostrar esse `titulo` como texto do único `h1` e o still `https://image.tmdb.org/t/p/w1280` seguido desse caminho.
5. WHEN `backdropPath` é nulo ou `""` e `posterPath` não é vazio THEN the system SHALL usar `https://image.tmdb.org/t/p/w1280` seguido de `posterPath` como still.
6. WHEN `backdropPath` e `posterPath` são nulos ou `""` THEN the system SHALL mostrar o título e nenhuma imagem de still.
7. The film page SHALL NOT mostrar sinopse, gênero, duração, elenco, nota, trailer ou player.
8. IF o segmento `[id]` não casa com `/^[1-9]\d*$/` ou o número não cabe num inteiro do PostgreSQL, de 1 a 2147483647, THEN the system SHALL responder não encontrado.
9. IF nenhum filme tem esse id THEN the system SHALL responder não encontrado.
10. WHEN o filme existe THEN the system SHALL definir o segmento do título do documento como o `titulo` desse filme, que o template da raiz renderiza como `{titulo} — Cineverso`.
11. The film page SHALL render `Topo` and SHALL NOT render `Voltar`.
12. WHILE a ficha ainda carrega the system SHALL mostrar o texto `Carregando o filme…`.
13. The home hero SHALL keep `Filme anterior`, `Próximo filme` and `Pausar a troca automática` as buttons.

**Independent Test**: Na home, acionar um pôster e o título do hero; na busca, acionar uma linha; abrir `/filme/969681` e um id inexistente.

---

## Edge Cases

- `backdropPath` `""` com pôster presente usa o pôster em `w1280` (AC 5).
- Os dois caminhos vazios deixam o título sem imagem (AC 6).
- `0`, `01`, `1.5`, `-3`, texto e `2147483648` não são id de filme (AC 8).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| PAG-01 | P1: Abrir o filme no still | Execute | Verified |
| PAG-02 | P1: Abrir o filme no still | Execute | Verified |
| PAG-03 | P1: Abrir o filme no still | Execute | Verified |
| PAG-04 | P1: Abrir o filme no still | Execute | Verified |
| PAG-05 | P1: Abrir o filme no still | Execute | Verified |
| PAG-06 | P1: Abrir o filme no still | Execute | Verified |
| PAG-07 | P1: Abrir o filme no still | Execute | Verified |
| PAG-08 | P1: Abrir o filme no still | Execute | Verified |
| PAG-09 | P1: Abrir o filme no still | Execute | Verified |
| PAG-10 | P1: Abrir o filme no still | Execute | Verified |
| PAG-11 | P1: Abrir o filme no still | Execute | Verified |
| PAG-12 | P1: Abrir o filme no still | Execute | Verified |
| PAG-13 | P1: Abrir o filme no still | Execute | Verified |

**Coverage:** 13 total, 13 mapped to checks, 0 unmapped

---

## Sources

- Plano aprovado: still do filme selecionado, título, clique no pôster, no título do hero e na busca
- `components/hero.tsx`: posição, degradê e tipo do título
- `lib/cartaz.mjs`: `urlDoPoster` no host do TMDB

---

## Success Criteria

- [x] O pôster, o título do hero e a linha da busca abrem `/filme/{id}`
- [x] `/filme/969681` mostra o título desse filme sobre o backdrop `w1280`
- [x] Um id que não é filme do catálogo não mostra ficha
