# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
