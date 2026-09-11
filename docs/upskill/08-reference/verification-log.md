# Verification Log

> **Superseded in part.** Entries dated 2026-06-16 and 2026-06-17 describe a
> multi-tenant SaaS version of this codebase — Postgres in Docker, Auth.js,
> Stripe, organizations, a reminder cron route, `prisma/migrations/`. Those
> entries were accurate when written and are kept as history. The app has since
> been rewritten as a local-only, single-learner trainer on SQLite. Where an
> entry below refers to a subsystem that no longer exists, read it as a record
> of the past, not as guidance. See the 2026-09-10 entry for what is true now.

Date: 2026-06-16 America/Los_Angeles.

## Commands/Inspection Run For This Documentation Pass

| Item | Result |
| --- | --- |
| `Get-Content` pasted request | Read successfully |
| `git status --short` | Clean before docs |
| `rg --files` | Inspected repository file inventory |
| Root README/package | Inspected setup and scripts |
| Numbered source inspection | Inspected server actions, review, gamification, user helper, scheduler, sandbox, lesson/review UI, schema, seed, content schema, validation script, auth, queries, route pages, tests, CI |

## Commands Previously Verified In This Workspace

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | Passed, 8 unit tests |
| `npm run validate:content` | Passed, 3 course files |
| `npm run build` | Passed |
| `prisma validate` with `DATABASE_URL` | Passed |

## Not Verified

*(As recorded on 2026-06-16. The first four items concern subsystems the
local-only rewrite removed; they are history, not open work.)*

- `docker compose up -d`: Docker daemon was unavailable earlier. **Superseded — there is no Docker Compose file.**
- `npm run db:migrate` and `npm run db:seed`: require local Postgres. **Superseded — the database is SQLite, applied with `db:push`; there is no `db:migrate` script.**
- Production Auth.js provider behavior: keys not configured. **Superseded — there is no authentication.**
- Stripe behavior: feature flag/stub only. **Superseded — there is no billing.**
- `npm run test:e2e`: requires a seeded DB and a running app. **Still open.**

## Uncertainties

*(As recorded on 2026-06-16.)*

- Whether demo fallback will be disabled before production. **Resolved by the rewrite — there is no production and no demo fallback; there is one local learner.**
- Whether the simplified scheduler is acceptable versus full FSRS for launch. **Still open.**
- Whether code exercise hidden tests should remain client-visible. **Still open.**
- Final deployment target and observability stack. **Resolved by the rewrite — there is no deployment target.**

## 2026-06-17 C#/.NET Documentation Expansion

Inspected:
- Existing C#/.NET mentions across `docs/upskill` with `rg`.
- [`docs/upskill/07-career-and-collaboration/04-interview-prep-from-this-repo.md`](../07-career-and-collaboration/04-interview-prep-from-this-repo.md)
- [`docs/upskill/02-stack-and-language-mastery/01-language-runtime-model.md`](../02-stack-and-language-mastery/01-language-runtime-model.md)

Changed:
- Added [`docs/upskill/07-career-and-collaboration/05-csharp-dotnet-interview-lab.md`](../07-career-and-collaboration/05-csharp-dotnet-interview-lab.md).
- Expanded C#/.NET transfer guidance in the runtime model and interview overview.
- Linked the new lab from the upskill README and career module README.

Not run:
- Product lint/typecheck/tests were not re-run for this docs-only expansion because the worktree already contained unrelated product/content changes outside `docs/upskill`.

## 2026-09-10 Local-Only Rewrite Documentation Correction

Context: the product was rewritten from a multi-tenant SaaS learning platform
into a local-only, single-learner trainer. This pass corrected `docs/upskill/`
so it describes the codebase that exists.

Verified by reading the source, not by running the app:

| Claim | Evidence |
| --- | --- |
| SQLite, one file at `data/skillforge.db` | [`prisma/schema.prisma:10-13`](../../../prisma/schema.prisma#L10-L13) |
| No migrations directory; schema applied with `prisma db push` | `prisma/` contains only `schema.prisma` and `seed.ts`; `db:push` / `db:setup` / `db:reset` in `package.json` |
| No `db:migrate` script | `package.json` scripts block |
| No auth, no sessions, no billing, no tenancy, no Docker | No `src/lib/auth.ts`, no `src/app/api/`, no `docker-compose.yml`; `User` has no plan, role, or org |
| One learner, id `"local"` | [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40) |
| `awardActivity` is the single write path for progress | [`src/server/gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123) |
| Streak multiplier caps at 1.5x; levels are `75 * (n-1)^2`; two non-replenishing freezes | [`src/lib/gamification.ts:24`](../../../src/lib/gamification.ts#L24), [`:47-48`](../../../src/lib/gamification.ts#L47-L48), [`:120-156`](../../../src/lib/gamification.ts#L120-L156) |
| `Course` has no `isPro` field | [`prisma/schema.prisma:40-55`](../../../prisma/schema.prisma#L40-L55), [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts) |
| Seed upserts content by position key, so re-seeding preserves review history | [`prisma/seed.ts:28-92`](../../../prisma/seed.ts#L28-L92) |
| CI seeds a SQLite file, then lint / typecheck / validate:content / test / build; it does not run E2E | [`.github/workflows/ci.yml:22-28`](../../../.github/workflows/ci.yml#L22-L28) |

Not run:
- No lint, typecheck, test, or build was executed for this docs-only pass.
- Line-number anchors were re-derived from the current files; they drift with any source edit.
