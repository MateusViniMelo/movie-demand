# SEO do catálogo Specification

**Approved**: 2026-10-29 - user: "Implement the plan as specified, it is attached for your reference."

## Problem Statement

O crawler só recebe o título `Cineverso` e a descrição genérica do layout. Não há URL canônica, Open Graph, `robots.txt`, sitemap nem JSON-LD. `/busca` e `/api/busca` nasceriam indexáveis.

## Goals

- [ ] A home (`/`) é a única URL do sitemap, com metadados estáveis e JSON-LD `WebSite`.
- [ ] `/busca` responde `noindex`. `/api/busca` não entra no rastreio.
- [ ] Os textos e as regras ficam em funções que `node --test` importa.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Página de filme e URL por ficha | A ficha com player continua no roadmap |
| Indexar resultados, `SearchAction`, `hreflang` | A busca fica fora do índice |
| Imagem Open Graph | `public/` não tem arte de marca |
| Core Web Vitals e mudança do `h1` do herói | Esta entrega não mexe na vitrine |
| Conta, recomendação, página do experimento | Fora do catálogo atual |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Título e descrição da home | `Cineverso` e `Catálogo de filmes sob demanda, com populares, novidades, bem avaliados e em cartaz.` | O nome já está na marca. A descrição cita as listas da vitrine. | y |
| Título e descrição da busca | Segmento `Busca` com template `%s — Cineverso`, descrição `Resultados da busca no catálogo Cineverso.` | O template do layout vale para a rota filha. A home usa o título padrão, sem sufixo. | y |
| Como a busca sai do índice | Meta `noindex, nofollow`. `/busca` não entra em `Disallow`. | O crawler só honra `noindex` se rastrear a página. | y |
| Como a API sai do rastreio | `Disallow: /api/` e cabeçalho `X-Robots-Tag: noindex` no sucesso e no 500 | A API não é página. O cabeçalho cobre quem ignora o `robots.txt`. | y |
| Origem absoluta | `NEXT_PUBLIC_SITE_URL` quando for `http` ou `https` absoluto. Sem isso, `http://localhost:3000`. | Canônica, Open Graph e sitemap precisam de URL absoluta. | y |
| JSON-LD | Só `WebSite`, sem `potentialAction` | O pedido é o site, não a busca indexável. | y |
| Open Graph e Twitter | `website`, `pt_BR`, `siteName` Cineverso, card `summary`, sem imagem | Não há arte de marca em `public/`. | y |
| Canônica | Só na home. O layout raiz não define canônica. | `/busca` não herda `/` como canônica. | y |
| Metadados da busca | `export const metadata` estático, sem ler `searchParams` | Com `cacheComponents`, a query no servidor suspende a página. | y |
| Idioma | `lang` continua `pt-BR` | O documento já é português. | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Home indexável ⭐ MVP

**User Story**: Como um crawler, quero a home com título, descrição, canônica, Open Graph e JSON-LD de site.

**Why P1**: É a única URL que deve entrar no índice.

**Acceptance Criteria**:

1. The system SHALL publicar na home o título `Cineverso` e a descrição `Catálogo de filmes sob demanda, com populares, novidades, bem avaliados e em cartaz.`
2. The system SHALL publicar a URL canônica absoluta da home e os campos Open Graph `type=website`, `locale=pt_BR`, `siteName=Cineverso`, o mesmo título e a mesma descrição, sem imagem.
3. WHEN a home é renderizada THEN the system SHALL incluir um JSON-LD `@type` `WebSite` com `name` `Cineverso`, `inLanguage` `pt-BR`, `url` igual à origem com barra final e a descrição da home.
4. The system SHALL manter `lang="pt-BR"` no documento.

**Independent Test**: Abrir `/` e ler título, descrição, canônica, Open Graph e o script `application/ld+json`.

---

### P1: Busca e API fora do índice

**User Story**: Como um crawler, quero a busca fora do índice e a API fora do rastreio.

**Why P1**: Cada consulta geraria uma URL indexável.

**Acceptance Criteria**:

1. WHEN a pessoa abre `/busca` THEN the system SHALL enviar robots `noindex, nofollow`, título `Busca — Cineverso` e a descrição `Resultados da busca no catálogo Cineverso.`
2. WHEN `GET /api/busca` responde THEN the system SHALL incluir o cabeçalho `X-Robots-Tag: noindex` no sucesso e no erro 500.
3. The system SHALL NOT colocar `/busca` nem `/api/busca` no sitemap.

**Independent Test**: Abrir `/busca`, ler o meta robots, e pedir `GET /api/busca` no sucesso e num erro.

---

### P1: robots.txt e sitemap

**User Story**: Como um crawler, quero um `robots.txt` e um sitemap com só a home.

**Why P1**: Sem esses arquivos o índice não tem regra explícita.

**Acceptance Criteria**:

1. The system SHALL servir `robots.txt` com `User-agent: *`, `Allow: /`, `Disallow: /api/` e a URL absoluta do sitemap.
2. The system SHALL servir um sitemap com uma única URL, a home absoluta.
3. IF `NEXT_PUBLIC_SITE_URL` está ausente ou não é uma URL absoluta `http` ou `https` THEN the system SHALL usar `http://localhost:3000` como origem.

**Independent Test**: Abrir `/robots.txt` e `/sitemap.xml` com e sem `NEXT_PUBLIC_SITE_URL`.

---

## Edge Cases

- WHEN `/busca` abre com `q` ou `pagina` THEN the system SHALL manter `noindex, nofollow`. O metadado é da rota.
- WHEN `GET /api/busca` responde THEN the system SHALL continuar devolvendo o JSON atual. Só entra o cabeçalho.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SEO-01 | P1: Home indexável | Execute | Verified |
| SEO-02 | P1: Home indexável | Execute | Verified |
| SEO-03 | P1: Home indexável | Execute | Verified |
| SEO-04 | P1: Home indexável | Execute | Verified |
| SEO-05 | P1: Busca e API fora do índice | Execute | Implementing |
| SEO-06 | P1: Busca e API fora do índice | Execute | Implementing |
| SEO-07 | P1: Busca e API fora do índice | Execute | Implementing |
| SEO-08 | P1: robots.txt e sitemap | Execute | Implementing |
| SEO-09 | P1: robots.txt e sitemap | Execute | Implementing |
| SEO-10 | P1: robots.txt e sitemap | Execute | Implementing |

**Coverage:** 10 total, 10 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] A home publica título, descrição, canônica, Open Graph sem imagem e JSON-LD `WebSite`.
- [ ] `/busca` fica `noindex, nofollow` e some do sitemap.
- [ ] `/api/` fica em `Disallow` e `GET /api/busca` manda `X-Robots-Tag: noindex`.
- [ ] Sem `NEXT_PUBLIC_SITE_URL` válida, a origem é `http://localhost:3000`.
