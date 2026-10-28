# Catálogo TMDB no PostgreSQL

## Problem Statement

A tabela `filmes` descreve o recorte do experimento (`titulo`, `descricao`, um `genero`, `tags`, `url_midia`, `origem`). O catálogo em `data/tmdb/` é outro dado: 72 filmes do TMDB, gêneros, coleções, elenco e quatro listas. Sem tabelas novas e sem seed, esse JSON não chega ao PostgreSQL.

## Goals

- [ ] O Prisma descreve o catálogo TMDB no lugar das colunas do experimento
- [ ] `npm run db:seed` grava `data/tmdb/` e a segunda execução deixa as mesmas contagens
- [ ] A home continua lendo `lib/filmes.ts`

## Out of Scope

| Feature | Reason |
| --- | --- |
| Trocar `app/page.tsx` para o Prisma | A vitrine local já está verificada |
| Busca textual e página do experimento | Dependem da etapa de medição |
| Tabela de equipe técnica | Os JSON de elenco só trazem `cast` |
| Tabelas de empresa, país e idioma | Ficam em colunas JSON |
| Commit git | O pedido desta feature é sem commits |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Destino da tabela `filmes` | Substituir o model e abandonar tags, `url_midia` e `origem` | Escolha do pedido | yes |
| Normalização | Filme, gênero, filme-gênero, coleção, pessoa, elenco e posição nas listas; empresas, países e idiomas em JSON | Escolha do pedido | yes |
| Histórico de migração | A migração nova derruba `filmes` e o enum `Origem`; as migrações antigas permanecem | O banco já aplicou o init | yes |
| Posição na lista | Inteiro de 1 a 20, na ordem do array `results` | A primeira ficha da lista é a posição 1 | yes |
| Seed repetido | Uma transação apaga o catálogo e reinsere | A segunda execução não duplica linhas | yes |
| Falha de validação | O seed lança erro antes da transação | Um JSON inválido não grava pela metade | yes |
| Mensagem de lista | Contém o slug da lista e `20` | O teste precisa de um desfecho exato | yes |
| Mensagem de elenco ausente | Contém `elenco/` e o id do filme | O teste precisa de um desfecho exato | yes |
| Mensagem de gênero ausente | Contém o id do gênero | O teste precisa de um desfecho exato | yes |
| Sinopse vazia | Texto `NOT NULL`; string vazia permanece vazia | O filme `1712451` tem `overview` `""` | yes |
| `receita` | `bigint` | A maior receita do recorte passa de 2^31-1 | yes |
| Home | Continua em `lib/filmes.ts` | Fora do escopo desta feature | yes |
| Commits | Nenhum | Pedido explícito | yes |
| Demais dimensões (auth, pagamento, TTL, observabilidade) | N/A para este escopo | Não há usuário, pagamento nem expiração | yes |

**Open questions:** none

---

## User Stories

### P1: Substituir o model do experimento ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero o schema Prisma no formato do TMDB para a tabela `filmes` deixar de exigir tags e `url_midia`.

**Why P1**: Sem o model novo, a migração e o seed não têm destino.

**Acceptance Criteria**:

1. WHEN `prisma/schema.prisma` é lido THEN o sistema SHALL omitir o enum `Origem`.
2. WHEN `prisma/schema.prisma` é lido THEN o model `Filme` SHALL mapear `filmes`, com `id` `Int` `@id` sem `autoincrement`, `titulo` `String`, `tituloOriginal` `String` em `titulo_original`, `sinopse` `String` `@default("")`, `tagline` `String?`, `dataLancamento` `DateTime` em `data_lancamento` com `@db.Date`, `duracaoMin` `Int` em `duracao_min`, `popularidade` `Float`, `notaMedia` `Float` em `nota_media`, `votos` `Int`, `adulto` `Boolean`, `video` `Boolean`, `softcore` `Boolean`, `idiomaOriginal` `String` em `idioma_original`, `imdbId` `String?` em `imdb_id`, `homepage` `String?`, `posterPath` `String?` em `poster_path`, `backdropPath` `String?` em `backdrop_path`, `orcamento` `Int`, `receita` `BigInt`, `status` `String`, `paisesOrigem` `Json` em `paises_origem`, `empresas` `Json`, `paisesProducao` `Json` em `paises_producao`, `idiomas` `Json` e `colecaoId` `Int?` em `colecao_id`.
3. WHEN `prisma/schema.prisma` é lido THEN o model `Filme` SHALL omitir `descricao`, `urlMidia`, `origem`, `tags` e um campo escalar `genero`.
4. WHEN `prisma/schema.prisma` é lido THEN o model `Genero` SHALL mapear `generos`, com `id` `Int` `@id` e `nome` `String`.
5. WHEN `prisma/schema.prisma` é lido THEN o model `Colecao` SHALL mapear `colecoes`, com `id` `Int` `@id`, `nome` `String`, `posterPath` `String?` em `poster_path` e `backdropPath` `String?` em `backdrop_path`.
6. WHEN `prisma/schema.prisma` é lido THEN o model `FilmeGenero` SHALL mapear `filme_generos`, com `@@id([filmeId, generoId])`.
7. WHEN `prisma/schema.prisma` é lido THEN o model `Pessoa` SHALL mapear `pessoas`, com `id` `Int` `@id`, `nome` `String`, `nomeOriginal` `String` em `nome_original`, `sexo` `Int`, `departamento` `String`, `popularidade` `Float`, `adulto` `Boolean` e `fotoPath` `String?` em `foto_path`.
8. WHEN `prisma/schema.prisma` é lido THEN o model `Elenco` SHALL mapear `elenco`, com `creditId` `String` `@id` em `credit_id`, `filmeId` `Int` em `filme_id`, `pessoaId` `Int` em `pessoa_id`, `personagem` `String`, `ordem` `Int` e `castId` `Int` em `cast_id`.
9. WHEN `prisma/schema.prisma` é lido THEN o model `Lista` SHALL mapear `listas`, com `slug` `String` `@id`.
10. WHEN `prisma/schema.prisma` é lido THEN o model `ListaFilme` SHALL mapear `lista_filmes`, com `@@id([listaSlug, filmeId])` e `@@unique([listaSlug, posicao])`.

**Independent Test**: `node --test tests/schema-contrato.test.mjs`

---

### P1: Criar as tabelas do catálogo ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero a migração aplicada para o banco `catalogo` ter as tabelas novas e não ter o enum `Origem`.

**Why P1**: O seed não grava sem essas tabelas.

**Acceptance Criteria**:

1. WHEN a migração do catálogo está aplicada THEN a tabela `filmes` SHALL ter, nesta ordem, `id` integer `NO`, `titulo` text `NO`, `titulo_original` text `NO`, `sinopse` text `NO`, `tagline` text `YES`, `data_lancamento` date `NO`, `duracao_min` integer `NO`, `popularidade` double precision `NO`, `nota_media` double precision `NO`, `votos` integer `NO`, `adulto` boolean `NO`, `video` boolean `NO`, `softcore` boolean `NO`, `idioma_original` text `NO`, `imdb_id` text `YES`, `homepage` text `YES`, `poster_path` text `YES`, `backdrop_path` text `YES`, `orcamento` integer `NO`, `receita` bigint `NO`, `status` text `NO`, `paises_origem` jsonb `NO`, `empresas` jsonb `NO`, `paises_producao` jsonb `NO`, `idiomas` jsonb `NO` e `colecao_id` integer `YES`.
2. WHEN a migração do catálogo está aplicada THEN `generos` SHALL ter `id` integer `NO` e `nome` text `NO`.
3. WHEN a migração do catálogo está aplicada THEN `colecoes` SHALL ter `id` integer `NO`, `nome` text `NO`, `poster_path` text `YES` e `backdrop_path` text `YES`.
4. WHEN a migração do catálogo está aplicada THEN `filme_generos` SHALL ter chave primária `(filme_id, genero_id)`.
5. WHEN a migração do catálogo está aplicada THEN `pessoas` SHALL ter `id` integer `NO`, `nome` text `NO`, `nome_original` text `NO`, `sexo` integer `NO`, `departamento` text `NO`, `popularidade` double precision `NO`, `adulto` boolean `NO` e `foto_path` text `YES`.
6. WHEN a migração do catálogo está aplicada THEN `elenco` SHALL ter chave primária `credit_id` text e as colunas `filme_id` integer `NO`, `pessoa_id` integer `NO`, `personagem` text `NO`, `ordem` integer `NO` e `cast_id` integer `NO`.
7. WHEN a migração do catálogo está aplicada THEN `listas` SHALL ter chave primária `slug` text.
8. WHEN a migração do catálogo está aplicada THEN `lista_filmes` SHALL ter chave primária `(lista_slug, filme_id)`, `posicao` integer `NO` e unicidade de `(lista_slug, posicao)`.
9. WHEN a migração do catálogo está aplicada THEN o banco SHALL omitir o tipo `Origem`.
10. WHEN o SQL da migração do catálogo é lido THEN o sistema SHALL derrubar a tabela `filmes` anterior e SHALL omitir `INSERT`.

**Independent Test**: `node --test tests/migracao-filmes.test.mjs`

---

### P1: Gravar o recorte de `data/tmdb/` ⭐ MVP

**User Story**: Como quem desenvolve o catálogo, quero um seed idempotente para os JSON locais virarem linhas no PostgreSQL.

**Why P1**: O schema vazio não é o catálogo.

**Acceptance Criteria**:

1. WHEN o seed roda sobre `data/tmdb` THEN o banco SHALL ter 72 `filmes`, 19 `generos`, 16 `colecoes`, 2563 `pessoas`, 2680 `elenco`, 4 `listas` e 80 `lista_filmes`.
2. WHEN o seed roda sobre `data/tmdb` THEN o filme `969681` SHALL ter título `Homem-Aranha: Um Novo Dia`, duração `143`, orçamento `225000000`, receita `2517281128`, `data_lancamento` `2026-07-29`, coleção `531241` e `empresas` contendo `Marvel Studios`.
3. WHEN o seed roda sobre `data/tmdb` THEN a diferença absoluta entre `nota_media` do filme `969681` e `8.473` SHALL ser menor que `0.000001`.
4. WHEN o seed roda sobre `data/tmdb` THEN o filme `1712451` SHALL ter `sinopse` igual a string vazia.
5. WHEN o seed roda sobre `data/tmdb` THEN o gênero `28` SHALL ter nome `Ação`.
6. WHEN o seed roda sobre `data/tmdb` THEN o crédito `52fe4220c3a36847f8005d17` SHALL ligar o filme `155` à pessoa `3894` (`Christian Bale`), com personagem `Bruce Wayne` e ordem `0`.
7. WHEN o seed roda sobre `data/tmdb` THEN a posição `1` SHALL ser o filme `969681` em `popular`, `1058424` em `now_playing`, `1232569` em `upcoming` e `1560520` em `top_rated`.
8. WHEN o seed roda sobre `data/tmdb` THEN cada lista SHALL ter posições de `1` a `20` e SHALL haver `8` filmes em mais de uma lista.
9. WHEN o seed roda uma segunda vez sobre `data/tmdb` THEN as contagens de `filmes`, `elenco` e `lista_filmes` SHALL permanecer `72`, `2680` e `80`.
10. IF uma lista não tem `20` filmes THEN o seed SHALL lançar erro cuja mensagem contém o slug dessa lista e `20`, e as contagens SHALL permanecer as do recorte válido. Isso vale para `0` e para `21` resultados.
11. IF falta `elenco/{id}.json` para um id da lista THEN o seed SHALL lançar erro cuja mensagem contém `elenco/` e esse id, e as contagens SHALL permanecer as do recorte válido.
12. IF um filme cita um gênero que não está em `generos.json` THEN o seed SHALL lançar erro cuja mensagem contém esse id, e as contagens SHALL permanecer as do recorte válido.
13. WHEN `prisma.config.ts` é lido THEN `migrations.seed` SHALL ser `node prisma/seed.mjs`.
14. WHEN `package.json` é lido THEN o script `db:seed` SHALL ser `prisma db seed`.

**Independent Test**: `node --test tests/catalogo-seed.test.mjs`

---

### P1: Não mudar a fonte da home ⭐ MVP

**User Story**: Como quem apresenta o catálogo, quero a raiz igual para o seed não trocar a vitrine.

**Why P1**: A listagem local já está verificada.

**Acceptance Criteria**:

1. WHEN `app/page.tsx` é lido THEN o sistema SHALL importar `filmes` de `@/lib/filmes`.
2. WHEN `app/page.tsx` é lido THEN o sistema SHALL omitir qualquer import de `@/lib/prisma` ou `generated/prisma`.

**Independent Test**: `node --test tests/home-fonte.test.mjs`

---

### P1: Documentar o seed ⭐ MVP

**User Story**: Como quem clona o repositório, quero o README e o estado do projeto dizendo como carregar o catálogo.

**Why P1**: Sem o comando, o seed fica invisível.

**Acceptance Criteria**:

1. WHEN `README.md` é lido THEN o sistema SHALL citar `npm run db:seed` e `data/tmdb`.
2. WHEN `.specs/project/STATE.md` é lido THEN o sistema SHALL registrar a decisão `AD-006` de substituir as colunas do experimento e de manter a home em `lib/filmes.ts`.

**Independent Test**: `node --test tests/docs-contrato.test.mjs`

---

## Edge Cases

- IF a lista `popular` vier com `0` ou com `21` resultados THEN o seed SHALL lançar erro com `popular` e `20` e SHALL deixar as contagens do recorte válido.
- IF o elenco do filme `1` não existir THEN o seed SHALL lançar erro com `elenco/1` e SHALL deixar as contagens do recorte válido.
- IF um filme citar o gênero `99999` THEN o seed SHALL lançar erro com `99999` e SHALL deixar as contagens do recorte válido.
- IF o filme `1712451` tiver `overview` vazio THEN `sinopse` SHALL ser `""`.
- IF a migração do catálogo inserir fichas THEN o SQL SHALL falhar o contrato, porque ele não contém `INSERT`.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CAT-01 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-02 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-03 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-04 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-05 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-06 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-07 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-08 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-09 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-10 | P1: Substituir o model do experimento | Tasks | Verified |
| CAT-11 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-12 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-13 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-14 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-15 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-16 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-17 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-18 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-19 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-20 | P1: Criar as tabelas do catálogo | Tasks | Verified |
| CAT-21 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-22 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-23 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-24 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-25 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-26 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-27 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-28 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-29 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-30 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-31 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-32 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-33 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-34 | P1: Gravar o recorte de data/tmdb | Tasks | Verified |
| CAT-35 | P1: Não mudar a fonte da home | Tasks | Verified |
| CAT-36 | P1: Não mudar a fonte da home | Tasks | Verified |
| CAT-37 | P1: Documentar o seed | Tasks | Verified |
| CAT-38 | P1: Documentar o seed | Tasks | Verified |

**ID format:** `CAT-[NUMBER]`

**Coverage:** 38 total, 38 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] O schema não tem `Origem`, `tags` nem `url_midia`, e a migração aplicada cria as oito tabelas
- [x] O seed deixa 72 filmes, 2680 créditos e 80 posições, e a segunda execução não duplica
- [x] `app/page.tsx` continua importando `@/lib/filmes`
