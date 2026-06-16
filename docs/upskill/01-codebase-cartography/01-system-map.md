# 01 System Map

## Repo Shape

This is a single Next.js application, not a monorepo. It has feature folders under `src/features`, route files under `src/app`, shared libraries under `src/lib`, server-side application logic under `src/server`, Prisma schema/migrations under `prisma`, and content seed files under `content/courses`.

```text
skillforgejs/
  src/app/                  Next App Router routes and route handlers
  src/features/             Feature UI/query modules
  src/server/               Server actions and domain mutations
  src/lib/                  Shared pure logic, auth, Prisma, sandbox
  src/components/           Reusable shell and UI primitives
  prisma/                   Schema, migration, seed script
  content/courses/          Versioned course JSON
  scripts/                  Content validation command
  tests/                    Unit and Playwright tests
```

## Ownership Map

| Area | Owns | Anchors | Public or private |
| --- | --- | --- | --- |
| Route pages | URL entry points and server-rendered composition | [`src/app/page.tsx:7-21`](../../../src/app/page.tsx#L7-L21), [`src/app/reviews/page.tsx:8-36`](../../../src/app/reviews/page.tsx#L8-L36) | Public interface |
| Feature client UI | Interactive filtering, lesson checks, review session | [`src/features/catalog/catalog-client.tsx:23-80`](../../../src/features/catalog/catalog-client.tsx#L23-L80), [`src/features/lessons/lesson-player.tsx:11-67`](../../../src/features/lessons/lesson-player.tsx#L11-L67) | Private UI internals |
| Server actions | Mutations from client to server | [`src/server/actions.ts:10-48`](../../../src/server/actions.ts#L10-L48) | Public server contract |
| Domain services | SRS, rewards, review update rules | [`src/server/review.ts:17-91`](../../../src/server/review.ts#L17-L91), [`src/server/gamification.ts:4-69`](../../../src/server/gamification.ts#L4-L69) | Private application layer |
| Pure libraries | Algorithmic logic without DB | [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74), [`src/lib/gamification.ts:18-79`](../../../src/lib/gamification.ts#L18-L79) | Reusable internals |
| Persistence | Tables, relations, indexes, seed | [`prisma/schema.prisma:41-287`](../../../prisma/schema.prisma#L41-L287), [`prisma/seed.ts:15-201`](../../../prisma/seed.ts#L15-L201) | Data contract |
| Worker sandbox | User code execution boundary | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35), [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76) | Security-sensitive internal |
| CI/tests | Regression gates | [`.github/workflows/ci.yml:16-21`](../../../.github/workflows/ci.yml#L16-L21), [`tests/unit/sandbox.test.ts:4-28`](../../../tests/unit/sandbox.test.ts#L4-L28) | Contribution contract |

## Public Interfaces

- Browser URLs: `/`, `/courses/[slug]`, `/courses/[slug]/lessons/[lessonId]`, `/reviews`, `/profile`, `/admin/org`.
- Route handlers: Auth.js at [`src/app/api/auth/[...nextauth]/route.ts`](../../../src/app/api/auth/%5B...nextauth%5D/route.ts) and review cron at [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).
- Server actions: [`completeLessonAction`](../../../src/server/actions.ts#L14-L30) and [`gradeReviewAction`](../../../src/server/actions.ts#L40-L48).
- Database schema: Prisma models and indexes in [`prisma/schema.prisma`](../../../prisma/schema.prisma).

## Private Internals

- `src/lib/srs/scheduler.ts` should remain swappable.
- `src/lib/gamification.ts` should remain pure enough to test without DB.
- `src/lib/sandbox/shared.ts` is an implementation detail of the worker runner.

## Senior Noticing

- `getCurrentUser` falls back to a shared demo user when no session exists in [`src/server/user.ts:4-22`](../../../src/server/user.ts#L4-L22). That is excellent for local evaluation, but it is a production isolation risk if accidentally enabled for real users.
- Review and reward mutations are not wrapped in one explicit transaction: [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24), [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90). Investigate atomicity if this becomes production-critical.
