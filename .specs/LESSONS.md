# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Reject a trailing question mark on a required Prisma scalar instead of matching the type name as a substring.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `prisma-schema` · harmful: 0
- features: setup-postgres-prisma
- evidence: tests/schema-contrato.test.mjs:33 (prisma-schema)
- last seen: 2026-10-21T16:24:12Z

### L-002 - Assert that datasource url receives env(DATABASE_URL), not only that the call appears somewhere in the config file.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `prisma-config` · harmful: 0
- features: setup-postgres-prisma
- evidence: tests/schema-contrato.test.mjs:25 (prisma-config)
- last seen: 2026-10-21T16:24:12Z

### L-003 - Assert a gitignore negation is the last matching pattern for that path, not only that the exception line exists.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `gitignore` · harmful: 0
- features: setup-postgres-prisma
- evidence: tests/env-contrato.test.mjs:17 (gitignore)
- last seen: 2026-10-21T16:42:24Z

### L-004 - Assert the exported client is constructed with the adapter instance, not only that the adapter constructor appears in the source.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `prisma-client` · harmful: 0
- features: setup-postgres-prisma
- evidence: tests/cliente-prisma.test.mjs:10 (prisma-client)
- last seen: 2026-10-21T16:52:37Z

### L-005 - Assert the exact branch of a conditional that selects a behavior value, not a bare literal anywhere in a text window.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `component-tests` · harmful: 0
- features: swiper-fileiras
- evidence: tests/fileira-swiper.test.mjs:41 (mutante 1) (component-tests)
- last seen: 2026-10-27T23:24:13Z

### L-006 - Assert the whole guard statement or render the component, not two substrings inside a character window.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `component-tests` · harmful: 0
- features: swiper-fileiras
- evidence: tests/fileira-swiper.test.mjs:45-48 (mutante 3) (component-tests)
- last seen: 2026-10-27T23:24:13Z

### L-007 - Bind each control to its action and assert enabling options, not only that method names exist in the source.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `component-tests` · harmful: 0
- features: swiper-fileiras
- evidence: tests/fileira-swiper.test.mjs:31-34 (AC2, mutante 4) (component-tests)
- last seen: 2026-10-27T23:24:13Z

### L-008 - Assert both sides of an exact-count guard, too few and too many, so a one-sided comparison cannot survive.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `seed` · harmful: 0
- features: catalogo-tmdb
- evidence: tests/catalogo-seed.test.mjs:CAT-30 (seed)
- last seen: 2026-10-27T23:55:57Z

### L-009 - When a runtime limit forces a different driver than the design names, keep the SPEC_DEVIATION marker and assert only the database outcome so tests stay driver-agnostic
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `seed` · harmful: 0
- features: catalogo-tmdb
- evidence: prisma/seed.mjs:1 (seed)
- last seen: 2026-10-28T00:19:20Z

### L-010 - Anchor conditional class assertions to the branch that applies them, not just to the class names appearing in the file
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: vitrine-home
- evidence: tests/home-fonte.test.mjs:22-26 (M4) (tests)
- last seen: 2026-10-28T00:45:50Z

### L-011 - When the spec says a component renders only X, assert no other text element or data field is rendered, not just the removed ones by name
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: vitrine-home
- evidence: tests/home-fonte.test.mjs:29-35 (M9) (tests)
- last seen: 2026-10-28T00:45:50Z

### L-012 - Assert the relative order of rendered sections in the page source, not just that each section is present
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `home` · harmful: 0
- features: vitrine-home
- evidence: mutante M10 app/page.tsx:25-28 (VIT-06) (home)
- last seen: 2026-10-28T00:51:03Z

### L-013 - Assert the full predicate of an empty-state condition, not only its prefix, and test it with both an empty and a non-empty input.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `home-page` · harmful: 0
- features: vitrine-home
- evidence: mutante 10 app/page.tsx:19 (VIT-10); tests/home-fonte.test.mjs:46 (home-page)
- last seen: 2026-10-28T00:54:52Z

### L-014 - Ao fixar uma URL absoluta, o teste afirma http, uma porta explícita e um caminho sem barra final. Só https deixa esquema, porta e caminho soltos.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `seo` · harmful: 0
- features: seo
- evidence: SEO-10 (seo)
- last seen: 2026-10-29T17:29:34Z

### L-015 - Assert the migration statement and each persisted value, not only a column already applied or a shared prefix.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `prisma` · harmful: 0
- features: trailer-filme
- evidence: tests/migracao-filmes.test.mjs:TRL-02 (prisma)
- last seen: 2026-11-03T13:58:42Z

### L-016 - A missing JSON key and an explicit null are different inputs; assert both when either must be stored as NULL.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `seed` · harmful: 0
- features: trailer-filme
- evidence: tests/catalogo-seed.test.mjs:TRL-05 (seed)
- last seen: 2026-11-03T13:58:42Z

### L-017 - Assert a published port sits inside the ports block, not only that the port line appears somewhere in the service.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `compose` · harmful: 0
- features: setup-redis
- evidence: tests/redis-compose.test.mjs:16 (compose)
- last seen: 2026-11-04T23:36:35Z

### L-018 - Assert the exported client is initialized by the factory that reads the env url, not only that the factory text appears somewhere in the file.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `redis-client` · harmful: 0
- features: setup-redis
- evidence: tests/redis-cliente.test.mjs:14 (redis-client)
- last seen: 2026-11-04T23:36:35Z

### L-019 - Assert the exact guard condition, not only that a substring of the condition appears in the file.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `redis-client` · harmful: 0
- features: setup-redis
- evidence: tests/redis-cliente.test.mjs:23 (redis-client)
- last seen: 2026-11-04T23:36:35Z

### L-020 - Assert a version token with a boundary so a longer token does not match.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `docs` · harmful: 0
- features: setup-redis
- evidence: tests/redis-docs.test.mjs:10 (docs)
- last seen: 2026-11-04T23:36:35Z

### L-021 - Treat dynamic import and require of a forbidden package as an import, not only a from clause.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `redis-client` · harmful: 0
- features: setup-redis
- evidence: tests/redis-cliente.test.mjs:48 (redis-client)
- last seen: 2026-11-04T23:36:35Z

### L-022 - Assert the id the mapper returns, not only that the component template names filme.id.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `routes` · harmful: 0
- features: pagina-filme
- evidence: tests/filme-ui.test.mjs:PAG-01 (routes)
- last seen: 2026-11-05T16:54:25Z

### L-023 - Reject an id that fits a JavaScript safe integer but not the database integer column before querying.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `routes` · harmful: 0
- features: pagina-filme
- evidence: lib/filme.mjs:idDoFilme (routes)
- last seen: 2026-11-05T16:54:26Z

### L-024 - Assert a ratio with unequal set sizes, not only cases where both sides have the same count.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `recomendacoes` · harmful: 0
- features: recomendacoes
- evidence: lib/recomendacoes.mjs:96 (recomendacoes)
- last seen: 2026-11-05T19:15:32Z

### L-025 - Assert a tie-break with values inserted in the opposite order of the expected sort.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `recomendacoes` · harmful: 0
- features: recomendacoes
- evidence: lib/recomendacoes.mjs:81 (recomendacoes)
- last seen: 2026-11-05T19:15:32Z

### L-026 - Assert the inclusion branch of a score, not only the cases that stay out.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `recomendacoes` · harmful: 0
- features: recomendacoes
- evidence: lib/recomendacoes.mjs:113 (recomendacoes)
- last seen: 2026-11-05T19:15:32Z

### L-027 - Assert every return path that should show the row, including the empty catalog.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `recomendacoes` · harmful: 0
- features: recomendacoes
- evidence: app/page.tsx:48 (recomendacoes)
- last seen: 2026-11-05T19:15:32Z

### L-028 - Assert the list is cleared when a new request starts, not only that the first state is empty.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `recomendacoes` · harmful: 0
- features: recomendacoes
- evidence: components/recomendacoes.tsx:24 (recomendacoes)
- last seen: 2026-11-05T19:15:32Z

### L-029 - Assert the storage handler calls the reload, not only that it names the key predicate.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `recomendacoes` · harmful: 0
- features: recomendacoes
- evidence: tests/recomendacoes.test.mjs:115 (recomendacoes)
- last seen: 2026-11-05T19:15:32Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
