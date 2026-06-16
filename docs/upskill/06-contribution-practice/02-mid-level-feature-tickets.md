# 02 Mid-Level Feature Tickets

Mid-level tickets cross layers and require design notes before implementation.

## Ticket 1: Server-Derived Review Correctness
- Layers: review UI, server action, review service, tests.
- Anchors: [`src/features/review/review-session.tsx:57-66`](../../../src/features/review/review-session.tsx#L57-L66), [`src/server/review.ts:39-91`](../../../src/server/review.ts#L39-L91).
- Design notes: how to grade MCQ/cloze, what to do for code items, migration impact.
- Rollback: keep old input accepted but ignored.
- Tests: malicious `correct: true`, wrong answer, right answer.

## Ticket 2: Pro Course Enforcement
- Layers: Prisma user plan, course query, lesson route, completion action, UI.
- Anchors: [`prisma/schema.prisma:22-24`](../../../prisma/schema.prisma#L22-L24), [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65).
- Risk: locking demo content accidentally.
- Rollback: feature flag enforcement.

## Ticket 3: Transactional Review Grading
- Layers: review service, Prisma transaction, tests.
- Anchors: [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90).
- Risk: transaction API changes return values.

## Ticket 4: Guest Progress Migration
- Layers: client local guest store, server action, auth callback, DB merge.
- Anchors: [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21), [`README.md`](../../../README.md).
- Risk: duplicate progress and privacy.

## Ticket 5: Reminder Outbox
- Layers: schema, cron route, worker/route, tests.
- Anchors: [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).
- Security: cron secret, no email leaks.

## Ticket 6: Catalog Server Pagination
- Layers: query, URL search params, client filters.
- Anchors: [`src/features/catalog/queries.ts:4-20`](../../../src/features/catalog/queries.ts#L4-L20), [`src/features/catalog/catalog-client.tsx:39-47`](../../../src/features/catalog/catalog-client.tsx#L39-L47).
- Risk: losing simple local UX.

## Ticket 7: Stable Content IDs
- Layers: JSON content, schema, seed, migration, review-state continuity.
- Anchors: [`prisma/seed.ts:41-73`](../../../prisma/seed.ts#L41-L73).
- Risk: deleting/recreating items resets reviews.

## Ticket 8: Organization Authorization
- Layers: schema, user helper, admin route, tests.
- Anchors: [`prisma/schema.prisma:238-247`](../../../prisma/schema.prisma#L238-L247), [`src/app/admin/org/page.tsx`](../../../src/app/admin/org/page.tsx).
- Risk: admin route leaks org details.

## Ticket 9: Sandbox Hidden Test Redesign
- Layers: content model, client runner, possible server runner.
- Anchors: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76).
- Risk: server execution cost/security.

## Ticket 10: Real Stripe Subscription Gate
- Layers: env, Stripe webhook, user plan, UI, tests.
- Anchors: [`prisma/schema.prisma:22-24`](../../../prisma/schema.prisma#L22-L24), [`README.md`](../../../README.md).
- Rollback: keep Core access unchanged.

## Ticket 11: E2E CI With Postgres
- Layers: GitHub Actions, Docker service, migration/seed, Playwright.
- Anchors: [`.github/workflows/ci.yml:16-21`](../../../.github/workflows/ci.yml#L16-L21), [`playwright.config.ts`](../../../playwright.config.ts).
- Risk: flake and CI time.

## Ticket 12: Review Queue Pagination
- Layers: query, UI session, route state.
- Anchors: [`src/features/review/queries.ts:23-24`](../../../src/features/review/queries.ts#L23-L24).
- Risk: losing session continuity.
