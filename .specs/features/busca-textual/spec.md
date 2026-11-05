# Busca textual Specification

**Approved**: 2026-10-28 - user: "faça"

## Problem Statement

A home mostra o catálogo e não deixa procurar um filme pelo texto. A busca textual precisa achar título e sinopse no PostgreSQL, com o dicionário `portuguese`, e mostrar o resultado. Cada linha abre a ficha em `/filme/{id}`.

## Goals

- [x] Digitar no topo lista até 5 filmes, com banner, título, gênero e duração
- [x] Enter ou `Busca completa` abre `/busca` com o mesmo resultado, 10 por página
- [x] A ordem é a relevância e, no empate, o `id` crescente

## Out of Scope

| Feature | Reason |
| --- | --- |
| Página de um filme | O pedido deixa a ficha para depois |
| Busca por gênero, tags ou duração | É a outra busca do experimento |
| Nota, tempo e gabarito na tela | A página do experimento não é esta entrega |
| Commits | O pedido desta entrega é sem `git commit` |
| Coluna `tsvector` e migração | O recorte cabe numa consulta na hora |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Intervalo entre teclas | 200 ms | O pedido pede busca a cada tecla, sem uma consulta por caractere | y |
| Primeiro gênero | O gênero de menor `generos.id` | `filme_generos` não guarda posição | y |
| Banner | Backdrop em `w780`; sem ele, pôster em `w500`; sem os dois, sem imagem | O pedido pede o banner e o catálogo já usa esses tamanhos | y |
| Texto buscado | `titulo`, `titulo_original` e `sinopse` | `descricao` saiu no AD-006; o título original continua texto | y |
| Última palavra | Prefixo `:*`, para `hom` casar com `homem` | A lista muda enquanto a pessoa digita | y |
| Página fora do intervalo | Volta para a última página que existe | O pedido pede paginação de 10 sem página vazia no fim | y |
| Linhas do painel | Cada linha aponta para `/filme/{id}` | A página do filme passou a existir | y |
| Home e a query | A raiz não lê `searchParams` | Com `cacheComponents`, ler a query no servidor suspende a vitrine | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Painel no topo ⭐ MVP

**User Story**: Como quem procura um filme, quero digitar no topo e ver os 5 primeiros sem apertar um botão de envio.

**Why P1**: É a busca que a pessoa usa na home.

**Acceptance Criteria**:

1. WHEN a pessoa digita texto que não é só espaço no campo do topo THEN the system SHALL mostrar até 5 filmes, cada um com banner, título, gênero e duração, sem botão de envio.
2. WHEN o campo fica vazio ou só com espaços THEN the system SHALL fechar o painel.
3. IF a consulta não encontra filme THEN the system SHALL mostrar o texto `Nenhum filme para esta busca.`
4. IF a consulta ao banco falha THEN the system SHALL mostrar o texto `A busca falhou.`
5. WHEN a pessoa aciona Enter ou o controle `Busca completa` com texto não vazio THEN the system SHALL abrir `/busca?q=<texto>&pagina=1`.
6. WHEN a pessoa aciona uma linha do painel THEN the system SHALL abrir `/filme/{id}` dessa linha.

**Independent Test**: Digitar `hom` no topo, ver até 5 linhas com título, e acionar `Busca completa`.

---

### P1: Página da busca

**User Story**: Como quem quer o resultado inteiro, quero uma página com 10 filmes por vez.

**Why P1**: O painel só mostra os 5 primeiros.

**Acceptance Criteria**:

1. WHEN a pessoa abre `/busca` com `q` não vazio THEN the system SHALL listar até 10 filmes na mesma ordem do painel, na coluna `mx-auto w-full max-w-6xl`.
2. WHEN a pessoa aciona `Página anterior` ou `Próxima página` THEN the system SHALL mudar o parâmetro `pagina` e mostrar o corte de 10 dessa página.
3. IF `pagina` passa da última THEN the system SHALL mostrar a última página que existe.
4. IF `/busca` abre sem `q` ou com `q` só de espaços THEN the system SHALL mostrar `Digite um filme para buscar.` e zero filmes.
5. The home SHALL NOT ler a query desta busca no servidor.

**Independent Test**: Abrir `/busca?q=aranha&pagina=1`, passar para a página 2 se houver mais de 10, e abrir `/busca` sem `q`.

---

### P1: Consulta textual

**User Story**: Como quem avalia o experimento, quero que o texto case com título e sinopse no dicionário `portuguese`.

**Why P1**: Sem essa regra a tela não é a busca textual.

**Acceptance Criteria**:

1. WHEN o texto não é vazio THEN the system SHALL casar `titulo`, `titulo_original` e `sinopse` com `to_tsvector('portuguese', ...)`.
2. The system SHALL NOT colocar gênero nem duração no vetor textual.
3. WHEN dois filmes empatam na relevância THEN the system SHALL ordenar pelo `id` crescente.
4. WHEN a última palavra está incompleta THEN the system SHALL tratar essa palavra como prefixo, de modo que `hom` encontre `Homem-Aranha: Um Novo Dia`.
5. WHEN um filme é exibido THEN the system SHALL usar a URL do backdrop como banner, a URL do pôster quando o backdrop falta, e nenhuma imagem quando os dois faltam.
6. WHEN a duração é 0 ou o gênero falta THEN the system SHALL omitir essa parte na linha.
7. The system SHALL NOT mostrar `ts_rank` nem o tempo da consulta.

**Independent Test**: `node --test tests/busca.test.mjs tests/busca-pg.test.mjs` com o banco semeado.

---

## Edge Cases

- IF o texto passa de 80 caracteres THEN the system SHALL usar só os 80 primeiros.
- IF o texto só tem stopword do dicionário `portuguese` THEN the system SHALL tratar como nenhum filme.
- IF `pagina` não é um inteiro maior que zero THEN the system SHALL usar a página 1.
- IF `tamanho` na API não é 5 nem 10 THEN the system SHALL usar 5.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| BUS-01 | P1: Painel no topo | Tasks | Done |
| BUS-02 | P1: Painel no topo | Tasks | Done |
| BUS-03 | P1: Painel no topo | Tasks | Done |
| BUS-04 | P1: Painel no topo | Tasks | Done |
| BUS-05 | P1: Painel no topo | Tasks | Done |
| BUS-06 | P1: Painel no topo | Tasks | Done |
| BUS-07 | P1: Página da busca | Tasks | Done |
| BUS-08 | P1: Página da busca | Tasks | Done |
| BUS-09 | P1: Página da busca | Tasks | Done |
| BUS-10 | P1: Página da busca | Tasks | Done |
| BUS-11 | P1: Página da busca | Tasks | Done |
| BUS-12 | P1: Consulta textual | Tasks | Done |
| BUS-13 | P1: Consulta textual | Tasks | Done |
| BUS-14 | P1: Consulta textual | Tasks | Done |
| BUS-15 | P1: Consulta textual | Tasks | Done |
| BUS-16 | P1: Consulta textual | Tasks | Done |
| BUS-17 | P1: Consulta textual | Tasks | Done |
| BUS-18 | P1: Consulta textual | Tasks | Done |
| BUS-19 | Edge: texto além de 80 | Tasks | Done |
| BUS-20 | Edge: stopword | Tasks | Done |
| BUS-21 | Edge: pagina inválida | Tasks | Done |
| BUS-22 | Edge: tamanho inválido | Tasks | Done |

**ID format:** `BUS-[NUMBER]`

**Coverage:** 22 total, 22 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] `hom` no topo mostra até 5 filmes e cada linha abre `/filme/{id}`
- [x] `/busca?q=aranha&pagina=1` lista até 10, na coluna central
- [x] Gênero e duração não entram no vetor `portuguese`
