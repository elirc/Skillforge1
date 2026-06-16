# 04 Review Katas

## Kata 1: "Trust Review Correctness From Client"
**Author intent:** Award less XP for wrong reviews.
**Fake diff summary:** Server action accepts `correct` and blindly uses it for rewards.
**Files this resembles:** [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66), [`src/server/review.ts:79-90`](../../../src/server/review.ts#L79-L90)
**Your task:** Review this PR.
**Expected findings:**
Blocking:
- Server should derive MCQ/cloze correctness from stored KnowledgeItem payload.
Important:
- Add tests for wrong answer and malicious correct=true.
Optional:
- Improve naming of score vs correctness.
**Good review comment example:**
> Could we move correctness derivation server-side for MCQ/cloze? The current shape lets a caller send `correct: true`, which weakens the anti-gaming invariant.

## Kata 2: "Add Pro Course Button Only"
Blocking: UI-only gating does not enforce plan access. Anchor: [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65).
Important: Server actions and lesson route need plan checks.
Optional: Add clearer empty state copy.

## Kata 3: "Cron Sends Emails Directly"
Blocking: no auth, no idempotency, no retry record. Anchor: [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).
Important: Propose outbox.
Optional: Add metrics labels.

## Kata 4: "Move Scheduler Into Server Action"
Blocking: reduces testability and swappability. Anchor pure scheduler [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74).
Important: Keep domain algorithm pure.

## Kata 5: "Store Course Progress In LocalStorage"
Blocking: durable user progress belongs server-side. Anchor LessonCompletion [`prisma/schema.prisma:176-185`](../../../prisma/schema.prisma#L176-L185).
Important: Guest migration needs explicit design.

## Kata 6: "Replace Zod With Type Assertions"
Blocking: Type assertions do not validate JSON. Anchor [`src/lib/content-schema.ts:66-90`](../../../src/lib/content-schema.ts#L66-L90).
Important: Keep validation script in CI.

## Kata 7: "Remove Worker Timeout"
Blocking: infinite loops can hang execution. Anchor [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).
Important: Browser runner must terminate worker.

## Kata 8: "Delete And Reseed Production Content"
Blocking: seed script deletes module tree; unsafe for production migrations. Anchor [`prisma/seed.ts:41-42`](../../../prisma/seed.ts#L41-L42).
Important: Use content versions/stable IDs.

## Kata 9: "Add Achievement Rule In DB Text"
Important: Rule evaluation is currently code-driven in [`src/lib/gamification.ts:72-79`](../../../src/lib/gamification.ts#L72-L79). If moving to DB, define expression safety.

## Kata 10: "Query All Review States"
Blocking if unbounded: current query caps `take: 20` at [`src/features/review/queries.ts:23-24`](../../../src/features/review/queries.ts#L23-L24). Preserve pagination/backpressure.

## Kata 11: "Catch And Ignore Sandbox Errors"
Important: UI currently displays errors in [`src/features/lessons/code-exercise.tsx:59-61`](../../../src/features/lessons/code-exercise.tsx#L59-L61). Swallowing errors makes debugging impossible.

## Kata 12: "Use Demo User In Production"
Blocking: shared anonymous state. Anchor [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21).

## Review Rubric

- Blocking: correctness, security, data loss, broken invariants.
- Important: maintainability, testability, reliability, unclear ownership.
- Optional: style, naming, polish when behavior is safe.
