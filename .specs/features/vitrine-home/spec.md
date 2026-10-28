# Vitrine da home

## Problem Statement

A raiz ainda mostra o recorte local de `lib/filmes.ts`: um hero com título e sinopse, e fileiras Drama, Ficção e Animação. O PostgreSQL já tem as quatro listas do TMDB, com pôster em `poster_path`. Quem abre a home não vê esse catálogo.

## Goals

- [ ] A home mostra só pôsteres das listas do banco
- [ ] O carrossel de Novidades abre com o primeiro pôster maior
- [ ] As quatro fileiras aparecem na ordem pedida

## Out of Scope

| Feature | Reason |
| --- | --- |
| Página do filme e clique no pôster | O pedido é só a vitrine |
| Backdrop e texto no destaque | A tela fica só com pôster |
| Busca | Continua fora desta entrega |
| Apagar `data/tmdb` | O seed ainda lê essa pasta |
| Apagar `lib/filmes.ts` enquanto algum import existir | O arquivo sai só quando ninguém o importa |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Destaque | Carrossel de `upcoming` no topo, primeiro pôster maior, e as quatro fileiras abaixo, inclusive Novidades de novo | Escolha do pedido | yes |
| Slugs | Populares `popular`, Novidades `upcoming`, Bem avaliados `top_rated`, Em Cartaz `now_playing` | São as quatro listas do seed | yes |
| Ordem | `posicao` crescente, de 1 a 20 | A posição 1 é a primeira ficha da lista | yes |
| Pôster ausente | A ficha não entra no carrossel | Sem `poster_path` não há imagem | yes |
| URL | `https://image.tmdb.org/t/p/w500{poster_path}` na fileira e `w780` no primeiro de Novidades | Tamanho do TMDB para pôster e para o destaque | yes |
| Largura do destaque | O primeiro slide usa `w-[14rem]` e `sm:w-[22rem]`; os demais usam `w-[7.75rem]` e `sm:w-[11rem]` | O primeiro fica maior que o pôster da fileira | yes |
| Texto do pôster | Só a imagem, com `alt` igual ao `titulo` | O pedido é somente o pôster | yes |
| Lista vazia | A seção não renderiza | A fileira já some sem filmes | yes |
| Catálogo vazio | O texto `Nenhuma ficha neste catálogo.` | É o vazio que a home já usa | yes |
| Consulta em andamento | O texto `Carregando o catálogo.` dentro de `Suspense` | `cacheComponents` exige o fallback para a leitura do banco | yes |
| Falha do Prisma | O erro segue para o Next, sem texto próprio | Não há tela de erro pedida | yes |
| Home antiga | AD-007 substitui, na página, a frase da AD-006 que mantinha `lib/filmes.ts` | A home passa a ler o banco | yes |
| Demais dimensões (auth, pagamento, TTL, observabilidade, concorrência) | N/A para este escopo | A página só lê listas públicas | yes |

**Open questions:** none

---

## User Stories

### P1: Mostrar as listas do banco ⭐ MVP

**User Story**: Como quem abre o catálogo, quero ver os pôsteres gravados no PostgreSQL para a home deixar de usar o recorte local.

**Why P1**: Sem essa leitura, a tela continua no array de demonstração.

**Acceptance Criteria**:

1. WHEN a vitrine é montada THEN o sistema SHALL ordenar cada lista por `posicao` crescente e SHALL omitir filme com `poster_path` nulo.
2. WHEN a vitrine é montada THEN o destaque SHALL ser a lista `upcoming`, o primeiro pôster SHALL usar `w780` e os demais SHALL usar `w500`.
3. WHEN a vitrine é montada THEN as fileiras SHALL ser, nesta ordem, `Filmes Populares` (`popular`), `Novidades` (`upcoming`), `Filmes Bem avaliados` (`top_rated`) e `Filmes em Cartaz` (`now_playing`), todas com `w500`.
4. WHEN o banco tem o recorte semeado THEN a posição 1 SHALL ser o filme `1232569` em `upcoming`, `969681` em `popular`, `1560520` em `top_rated` e `1058424` em `now_playing`.
5. The sistema SHALL montar a URL `https://image.tmdb.org/t/p/{tamanho}{poster_path}`.

**Independent Test**: `node --test tests/vitrine.test.mjs`

---

### P1: Trocar a home pelos pôsteres

**User Story**: Como quem abre a raiz, quero um carrossel de Novidades com o primeiro pôster maior e as quatro fileiras abaixo para ver o catálogo do banco.

**Why P1**: É a tela pedida.

**Acceptance Criteria**:

1. WHEN a raiz abre THEN o sistema SHALL mostrar o carrossel `Novidades` com `primeiroMaior` e, abaixo, as fileiras `Filmes Populares`, `Novidades`, `Filmes Bem avaliados` e `Filmes em Cartaz`.
2. WHEN o primeiro slide do destaque renderiza THEN o sistema SHALL usar `w-[14rem]` e `sm:w-[22rem]`, e os outros slides SHALL usar `w-[7.75rem]` e `sm:w-[11rem]`.
3. WHEN um pôster renderiza THEN o sistema SHALL mostrar só a imagem, com `alt` igual ao título, e SHALL omitir gênero, duração e sinopse.
4. WHILE a consulta não terminou o sistema SHALL mostrar `Carregando o catálogo.`
5. IF destaque e fileiras não tiverem filmes THEN o sistema SHALL mostrar `Nenhuma ficha neste catálogo.`
6. The sistema SHALL permitir imagens de `https://image.tmdb.org/t/p/**` em `next.config.ts`.
7. WHEN `app/page.tsx` é lido THEN o sistema SHALL consultar o Prisma e SHALL omitir o import de `@/lib/filmes`.

**Independent Test**: `node --test tests/home-fonte.test.mjs tests/fileira-swiper.test.mjs`

---

### P1: Registrar a troca da fonte

**User Story**: Como quem lê o repositório, quero o README e o estado do projeto dizendo que a home lê as listas do banco.

**Why P1**: A frase antiga diz que a home continua em `lib/filmes.ts`.

**Acceptance Criteria**:

1. WHEN `README.md` é lido THEN o sistema SHALL citar `Filmes Populares` e SHALL omitir a frase `A home continua lendo`.
2. WHEN `.specs/project/STATE.md` é lido THEN o sistema SHALL registrar `AD-007` dizendo que a home lê as listas do PostgreSQL.

**Independent Test**: `node --test tests/docs-contrato.test.mjs`

---

## Edge Cases

- IF um filme da lista não tem `poster_path` THEN a vitrine SHALL omitir esse filme.
- IF uma fileira não tem filmes THEN a seção SHALL não renderizar.
- IF o catálogo inteiro não tem pôster THEN a home SHALL mostrar `Nenhuma ficha neste catálogo.`

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| VIT-01 | P1: Mostrar as listas do banco | Tasks | Implementing |
| VIT-02 | P1: Mostrar as listas do banco | Tasks | Implementing |
| VIT-03 | P1: Mostrar as listas do banco | Tasks | Implementing |
| VIT-04 | P1: Mostrar as listas do banco | Tasks | Implementing |
| VIT-05 | P1: Mostrar as listas do banco | Tasks | Implementing |
| VIT-06 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-07 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-08 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-09 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-10 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-11 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-12 | P1: Trocar a home pelos pôsteres | Tasks | Implementing |
| VIT-13 | P1: Registrar a troca da fonte | Tasks | Implementing |
| VIT-14 | P1: Registrar a troca da fonte | Tasks | Implementing |

**ID format:** `VIT-[NUMBER]`

**Coverage:** 14 total, 14 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] A raiz mostra o carrossel de Novidades com o primeiro pôster maior
- [ ] As quatro fileiras aparecem na ordem pedida, só com pôsteres
- [ ] A posição 1 de cada lista é o filme do recorte semeado
