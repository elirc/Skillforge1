# 02 File Reading Order

## Junior Path

| Order | File | Why it matters | Look for | Avoid |
| --- | --- | --- | --- | --- |
| 1 | [`README.md`](../../../README.md) | Setup and architecture in plain language | Commands and feature summary | Open questions as blockers |
| 2 | [`package.json`](../../../package.json) | Project commands | `lint`, `typecheck`, `test`, `validate:content` | Dependency version debate |
| 3 | [`src/app/layout.tsx`](../../../src/app/layout.tsx) | Global shell and providers entry | Metadata, fonts, providers | CSS details |
| 4 | [`src/app/page.tsx`](../../../src/app/page.tsx) | Catalog route entry | Server component fetch -> client component | Styling |
| 5 | [`src/features/catalog/catalog-client.tsx`](../../../src/features/catalog/catalog-client.tsx) | Client filtering example | `useState`, `useMemo`, progress calc | Perfect search UX |
| 6 | [`src/app/courses/[slug]/page.tsx`](../../../src/app/courses/%5Bslug%5D/page.tsx) | Dynamic course page | Metadata, `notFound`, outline links | Pro billing later |
| 7 | [`src/app/courses/[slug]/lessons/[lessonId]/page.tsx`](../../../src/app/courses/%5Bslug%5D/lessons/%5BlessonId%5D/page.tsx) | Lesson data load | User-scoped completions at lines 17-24 | UI internals |
| 8 | [`src/features/lessons/lesson-player.tsx`](../../../src/features/lessons/lesson-player.tsx) | Main learning UI | Zod parsing, completion button | CodeMirror internals |
| 9 | [`src/server/actions.ts`](../../../src/server/actions.ts) | Server action boundary | Input parsing and revalidation | Prisma schema details |
| 10 | [`tests/unit/srs.test.ts`](../../../tests/unit/srs.test.ts) | Test style | Given/when/then expectations | Full FSRS theory |

## Mid-Level Path

Continue with:

| File | Why | Look for |
| --- | --- | --- |
| [`prisma/schema.prisma`](../../../prisma/schema.prisma) | Domain model and constraints | Unique keys and indexes, especially ReviewState |
| [`src/server/review.ts`](../../../src/server/review.ts) | Cross-layer review mutation | User-scoped `findFirstOrThrow`, attempt logging, reward side effect |
| [`src/lib/srs/scheduler.ts`](../../../src/lib/srs/scheduler.ts) | Pure algorithm boundary | Inputs, outputs, deterministic testing |
| [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) | Pure reward rules | Time handling, streak freeze semantics |
| [`src/server/gamification.ts`](../../../src/server/gamification.ts) | DB-backed reward update | Leaderboard and achievement coupling |
| [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts) | Data contracts for course JSON | Discriminated unions |
| [`scripts/validate-content.ts`](../../../scripts/validate-content.ts) | CI content safety | Reference solution execution |
| [`src/lib/sandbox/shared.ts`](../../../src/lib/sandbox/shared.ts) | Security-sensitive execution harness | Disabled APIs, `new Function`, structured result |
| [`tests/unit/sandbox.test.ts`](../../../tests/unit/sandbox.test.ts) | Timeout test | Infinite loop protection |
| [`tests/e2e/happy-path.spec.ts`](../../../tests/e2e/happy-path.spec.ts) | Product-level regression path | What the happy path actually asserts |

## Senior Path

Read with critique:

| File | Senior question |
| --- | --- |
| [`src/server/user.ts`](../../../src/server/user.ts) | What separates local demo mode from production identity? |
| [`src/server/review.ts`](../../../src/server/review.ts) | Should review state update, attempt write, and XP award be transactional? |
| [`src/app/api/cron/reviews/route.ts`](../../../src/app/api/cron/reviews/route.ts) | How is this protected, scheduled, retried, and observed in production? |
| [`src/lib/sandbox/shared.ts`](../../../src/lib/sandbox/shared.ts) | What are the actual isolation guarantees and escape paths? |
| [`prisma/seed.ts`](../../../prisma/seed.ts) | Is seed idempotent enough? What data gets deleted and recreated? |
| [`prisma/migrations/20260616230000_init/migration.sql`](../../../prisma/migrations/20260616230000_init/migration.sql) | What would a rollback or zero-downtime migration require? |
| [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) | What does CI prove and what does it not prove? |

## Drill

Pick one file from each path. For each, write:
- Input contract.
- Output contract.
- State it reads or writes.
- One invariant.
- One missing or weak test.

Self-grade:
- Basic: names the file and function.
- Solid: identifies data shape and owner.
- Strong: identifies invariant, blast radius, and a regression test.
