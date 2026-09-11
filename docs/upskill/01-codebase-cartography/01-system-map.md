# 01 System Map

## Repo Shape

This is a single Next.js application, not a monorepo, and it runs entirely on one machine for one learner. It has feature folders under `src/features`, route files under `src/app`, shared libraries under `src/lib`, server-side application logic under `src/server`, the Prisma schema under `prisma`, and content source files under `content/`.

```text
skillforgejs/
  src/app/                  Next App Router routes
  src/features/             Feature UI/query modules
  src/server/               Server actions and domain mutations
  src/lib/                  Shared pure logic, enums, Prisma client, sandbox
  src/components/           Reusable shell and UI primitives
  prisma/                   SQLite schema and seed script (no migrations dir)
  content/                  Versioned course and problem source (JSON + TS exercises)
  data/                     skillforge.db, the local SQLite file (gitignored)
  scripts/                  Content assembly and validation command
  tests/                    Unit and Playwright tests
```

## Ownership Map

| Area | Owns | Anchors | Public or private |
| --- | --- | --- | --- |
| Route pages | URL entry points and server-rendered composition | [`src/app/page.tsx:7-21`](../../../src/app/page.tsx#L7-L21), [`src/app/reviews/page.tsx:8-36`](../../../src/app/reviews/page.tsx#L8-L36) | Public interface |
| Feature client UI | Interactive filtering, lesson checks, review session | [`src/features/catalog/catalog-client.tsx:23-80`](../../../src/features/catalog/catalog-client.tsx#L23-L80), [`src/features/lessons/lesson-player.tsx:11-67`](../../../src/features/lessons/lesson-player.tsx#L11-L67) | Private UI internals |
| Server actions | Mutations from client to server | [`src/server/actions.ts:19-104`](../../../src/server/actions.ts#L19-L104) | Public server contract |
| Domain services | SRS, rewards, quests, next-up feed | [`src/server/review.ts:17-92`](../../../src/server/review.ts#L17-L92), [`src/server/gamification.ts:60-122`](../../../src/server/gamification.ts#L60-L122), [`src/server/feed.ts:134-197`](../../../src/server/feed.ts#L134-L197) | Private application layer |
| Pure libraries | Algorithmic logic without DB | [`src/lib/srs/scheduler.ts`](../../../src/lib/srs/scheduler.ts), [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) | Reusable internals |
| Persistence | Tables, relations, indexes, seed | [`prisma/schema.prisma:16-261`](../../../prisma/schema.prisma#L16-L261), [`prisma/seed.ts`](../../../prisma/seed.ts) | Data contract |
| String/JSON column decoding | Turning SQLite's untyped columns back into unions and arrays | [`src/lib/enums.ts`](../../../src/lib/enums.ts) | Data contract |
| Worker sandbox | User code execution boundary | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35), [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76) | Security-sensitive internal |
| CI/tests | Regression gates | [`.github/workflows/ci.yml:13-28`](../../../.github/workflows/ci.yml#L13-L28), [`tests/unit/sandbox.test.ts`](../../../tests/unit/sandbox.test.ts) | Contribution contract |

## Public Interfaces

- Browser URLs: `/`, `/onboarding`, `/tracks`, `/courses/[slug]`, `/courses/[slug]/lessons/[lessonId]`, `/problems`, `/problems/[slug]`, `/reviews`, `/profile`.
- Route handlers: none. There are no files under `src/app/api`; every mutation enters through a server action instead of an HTTP endpoint.
- Server actions: [`completeLessonAction`](../../../src/server/actions.ts#L23-L43), [`gradeReviewAction`](../../../src/server/actions.ts#L53-L60), [`saveOnboardingAction`](../../../src/server/actions.ts#L70-L75), [`saveSettingsAction`](../../../src/server/actions.ts#L79-L84), and [`resetProgressAction`](../../../src/server/actions.ts#L87-L104).
- Database schema: Prisma models and indexes in [`prisma/schema.prisma`](../../../prisma/schema.prisma).

## Private Internals

- `src/lib/srs/scheduler.ts` should remain swappable.
- `src/lib/gamification.ts` should remain pure enough to test without DB.
- `src/lib/sandbox/shared.ts` is an implementation detail of the worker runner.

## Senior Noticing

- `getCurrentUser` upserts one hard-coded row, `LOCAL_USER_ID = "local"`, in [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40). Identity is a constant, not a lookup. Notice what that buys (zero auth surface, first run just works) and what it costs: every `where: { userId }` filter in the codebase is currently a tautology, so the code does not actually prove it scopes reads correctly. If this ever grew a second learner, those filters are the ones that must already be right.
- Review and reward mutations are not wrapped in one explicit transaction: [`src/server/actions.ts:27-39`](../../../src/server/actions.ts#L27-L39), [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91). A crash between the `ReviewState` update and the XP award leaves the ledger disagreeing with the schedule. Contrast with [`resetProgressAction`](../../../src/server/actions.ts#L87-L104), which does use `prisma.$transaction`.
