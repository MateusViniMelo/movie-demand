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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
