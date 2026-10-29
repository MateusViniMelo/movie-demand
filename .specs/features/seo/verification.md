# SEO verification

**Verdict**: PASS
**Mutations**: 3 - probed C10
**Proofs**: `proofs.md` at ac403bc
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| URL absoluta `http` vira localhost e C10 continua verde | mutation `http absoluto vira localhost` not killed (`lib/seo.mjs:23`). SEO-10 só preserva `https://`. Em HEAD, `http://cinema.local:8080` já devolve essa origem. | Em SEO-10, afirmar `origemDoSite({ NEXT_PUBLIC_SITE_URL: "http://cinema.local:8080" })` igual a `http://cinema.local:8080` | e014483 |
| A porta some da origem e C10 continua verde | mutation `porta fora da origem` not killed (`lib/seo.mjs:25`). Trocar `url.origin` por protocolo e hostname não falha o teste. | Em SEO-10, afirmar `origemDoSite({ NEXT_PUBLIC_SITE_URL: "https://cineverso.example:8443" })` igual a `https://cineverso.example:8443` | e014483 |
| Caminho sem barra final pode sumir e C10 continua verde | mutation `caminho sem barra final some` not killed (`lib/seo.mjs:24`). O teste só cobre `https://cineverso.example/catalogo/`. | Em SEO-10, afirmar `origemDoSite({ NEXT_PUBLIC_SITE_URL: "https://cineverso.example/catalogo" })` igual a `https://cineverso.example/catalogo` | e014483 |
