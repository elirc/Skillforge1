# 00 Fast Track

Use this when you have one weekend and want a fast win.

## Install, Run, Test

Verified from repository scripts:

```bash
corepack enable
corepack pnpm install
npm run lint
npm run typecheck
npm test
npm run validate:content
```

Inferred local DB flow from [`README.md`](../../README.md) and [`docker-compose.yml`](../../docker-compose.yml):

```bash
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
npm run test:e2e
```

Note: Docker daemon was unavailable during prior verification, so treat the DB/E2E commands as documented but not re-run in this pass.

## First Two Flows To Trace

1. Lesson completion:
   - UI calls `completeLessonAction` from [`src/features/lessons/lesson-player.tsx:30-34`](../../src/features/lessons/lesson-player.tsx#L30-L34).
   - Server validates, writes completion, seeds reviews, awards XP, and revalidates pages in [`src/server/actions.ts:10-29`](../../src/server/actions.ts#L10-L29).
2. Review grading:
   - UI submits recall score in [`src/features/review/review-session.tsx:60-74`](../../src/features/review/review-session.tsx#L60-L74).
   - Server schedules and records the attempt in [`src/server/review.ts:39-91`](../../src/server/review.ts#L39-L91).

## First 10 Files To Open

| Order | File | Look for | Do not get distracted by |
| --- | --- | --- | --- |
| 1 | [`README.md`](../../README.md) | Local workflow and architecture summary | Deployment questions not solved yet |
| 2 | [`package.json`](../../package.json) | Scripts and dependency choices | Version bikeshedding |
| 3 | [`prisma/schema.prisma`](../../prisma/schema.prisma) | Product nouns and relationships | Every Auth.js table detail |
| 4 | [`src/server/actions.ts`](../../src/server/actions.ts) | Server mutation boundaries | UI styling |
| 5 | [`src/server/review.ts`](../../src/server/review.ts) | ReviewState update contract | Exact scheduler tuning |
| 6 | [`src/lib/srs/scheduler.ts`](../../src/lib/srs/scheduler.ts) | Pure scheduling function | Whether it is full FSRS |
| 7 | [`src/features/lessons/lesson-player.tsx`](../../src/features/lessons/lesson-player.tsx) | Client validation and completion trigger | Tailwind class density |
| 8 | [`src/lib/sandbox/shared.ts`](../../src/lib/sandbox/shared.ts) | Worker harness contract | Perfect sandboxing claims |
| 9 | [`src/lib/gamification.ts`](../../src/lib/gamification.ts) | XP/streak pure logic | League persistence |
| 10 | [`tests/unit/sandbox.test.ts`](../../tests/unit/sandbox.test.ts) | Timeout regression coverage | Browser worker bundling |

## Small Safe Change To Attempt

Ticket: Add a unit test proving `scheduleReview(..., "easy")` sets `state` to `review` after a reviewed card with enough stability.

Read:
- [`src/lib/srs/scheduler.ts:32-66`](../../src/lib/srs/scheduler.ts#L32-L66)
- [`tests/unit/srs.test.ts:15-44`](../../tests/unit/srs.test.ts#L15-L44)

Suggested check:

```bash
npm test -- tests/unit/srs.test.ts
```

## Teach-Back Exercise

Explain, without reading notes, why `completeLessonAction` does not directly compute `ReviewState` due dates. A strong answer mentions server boundary, input validation, idempotent `upsert`, review-state ownership, and page revalidation.

## What This Fast Path Does Not Cover

- Auth provider setup details.
- Production email reminder delivery.
- Full Postgres migration rollout.
- Detailed security hardening of the sandbox.
- Feature-flagged Stripe checkout implementation.

## Verification Notes

- Inspected [`package.json`](../../package.json), [`README.md`](../../README.md), [`docker-compose.yml`](../../docker-compose.yml), server actions, scheduler, sandbox, and unit tests.
- Non-DB commands listed as verified passed earlier in this workspace.
