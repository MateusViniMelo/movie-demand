# Roadmap

**Current Milestone:** Listagem de demonstração
**Status:** Complete

---

## Listagem de demonstração

**Goal:** A raiz mostra as fichas locais no formato do banco.
**Target:** A pessoa confere os 10 filmes do recorte sem subir o PostgreSQL.

### Features

**Listagem de filmes** - COMPLETE

- Grade com as 10 fichas de exemplo
- Título, sinopse, gênero, tags e duração visíveis
- `url_midia` presente no dado e ausente da tela

---

## Catálogo jogável

**Goal:** A ficha abre o vídeo da demonstração.

### Features

**Ficha com player** - PLANNED

- Página do filme
- Player nativo apontando para `url_midia`

---

## Medição

**Goal:** As duas buscas rodam no PostgreSQL e a página do experimento mostra nota, tempo e gabarito.

### Features

**Carga no PostgreSQL** - PLANNED

- Banco `catalogo`, pool único e os CSV do experimento

**Busca textual e busca por metadados** - PLANNED

- Até 10 filmes, nota e tempo medido no servidor
- Desempate por `id` crescente

**Página do experimento** - PLANNED

- Uma necessidade por vez, em duas colunas
- Filmes do gabarito marcados

---

## Future Considerations

- Os 40 filmes julgados que completam os 50, e as 5.000 fichas sintéticas
- Publicação na Vercel com `DATABASE_URL`
