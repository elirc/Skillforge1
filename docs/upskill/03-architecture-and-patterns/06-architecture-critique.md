# 06 Architecture Critique

## Strongest Design Choices

1. The review scheduler is isolated as a pure module in [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74), with direct unit tests in [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).
2. Course content has a runtime schema in [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90) and a validation script that executes reference solutions in [`scripts/validate-content.ts:14-23`](../../../scripts/validate-content.ts#L14-L23).
3. User code execution is moved to a worker runner with timeout enforcement in [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35).
4. ReviewState has the right uniqueness and due queue index in [`prisma/schema.prisma:141-142`](../../../prisma/schema.prisma#L141-L142).
5. The code separates pure reward math from DB persistence across [`src/lib/gamification.ts:37-79`](../../../src/lib/gamification.ts#L37-L79) and [`src/server/gamification.ts:4-69`](../../../src/server/gamification.ts#L4-L69).

## Confirmed Risks

| Risk | Evidence | Impact | Suggested migration |
| --- | --- | --- | --- |
| Cron route lacks auth | [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19) | Anyone could trigger due-count query if deployed publicly | Require shared secret/header, add test, document scheduler |
| Demo user fallback is shared | [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21) | Anonymous users share state | Gate by env; implement per-browser guest id and migration |
| Pro gating is display-only | [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65) | Core users could access Pro lesson routes | Enforce in server queries/actions |
| Review correctness is client-supplied | [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66) | Easy reward gaming | Server derives correctness for MCQ/cloze |

## Hypotheses To Investigate

| Hypothesis | Evidence | How to verify |
| --- | --- | --- |
| Progress XP updates can race | Read-then-update in [`src/server/gamification.ts:5-22`](../../../src/server/gamification.ts#L5-L22) | Concurrent review integration test |
| Review update and attempt log should be transactional | Separate writes in [`src/server/review.ts:65-88`](../../../src/server/review.ts#L65-L88) | Fault-injection test or transaction design |
| Catalog query may over-fetch as courses grow | Nested include in [`src/features/catalog/queries.ts:7-13`](../../../src/features/catalog/queries.ts#L7-L13) | Seed large catalog and profile query/render |
| Sandbox equality is too naive | JSON stringify comparison in [`src/lib/sandbox/shared.ts:44-45`](../../../src/lib/sandbox/shared.ts#L44-L45) | Add tests for property order, NaN, undefined |

## Priority Improvements

1. Production safety guards:
   - Gate demo fallback behind explicit development env.
   - Add cron secret.
   - Enforce Pro access server-side.
   - Test strategy: unit tests for auth helpers, route handler tests, E2E for Core vs Pro.
2. Transactional review and reward writes:
   - Use `prisma.$transaction` for ReviewState update + Attempt insert.
   - Consider atomic XP increment.
   - Test strategy: integration test with local Postgres.
3. Server-derived review correctness:
   - Load KnowledgeItem payload in `gradeReviewItem`.
   - Compare MCQ/cloze answers server-side.
   - Leave code exercise review as self-recall unless server runner exists.
4. Real notification outbox:
   - Add NotificationOutbox table.
   - Cron writes jobs; worker sends.
   - Add idempotency key and delivery status.
5. Observability:
   - Add structured logs around server actions, cron, and sandbox failures.
   - Add health check route.

## If I Owned This For Three Months

Month 1:
- Harden auth/authorization boundaries.
- Add DB-backed integration tests.
- Convert risky multi-write flows to transactions.

Month 2:
- Improve content workflow: duplicate slug checks, stable content ids, content versioning.
- Add server-derived correctness and anti-gaming rules.
- Start real notification outbox.

Month 3:
- Build Stripe gating for Pro.
- Add organization authorization.
- Add performance profiling and query pagination for catalog/reviews.

## Drill

Pick one recommendation and write a one-page RFC. Include invariant, migration plan, rollback, tests, and "how we will know it broke."
