# 01 Good First Tickets

## Ticket 1: Add Scheduler Edge Case Test
**Difficulty:** Easy
**Estimated time:** 30-45 minutes
**Skills practiced:** Unit tests, time control
**Story:** As a maintainer, I want easy recall edge cases tested so scheduler changes are safer.
**Why this is a good contribution:** It follows existing tests and touches pure logic only.
**Acceptance criteria:**
- [ ] Add one test to `tests/unit/srs.test.ts`.
- [ ] Verify `easy` creates a longer interval for a review card.
**Read these anchors first:**
- [`src/lib/srs/scheduler.ts:32-66`](../../../src/lib/srs/scheduler.ts#L32-L66)
- [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44)
**Files likely touched:** `tests/unit/srs.test.ts`
**Implementation plan:** Copy existing test shape, use fixed `now`, assert interval/state.
**Illustrative fake-code shape:**
```ts
// Illustrative fake code: adapt to the repo.
it("...", () => expect(scheduleReview(state, "easy", now).interval).toBeGreaterThan(...));
```
**What could go wrong:** Testing exact values may make scheduler refactors brittle.
**Suggested checks:** `npm test -- tests/unit/srs.test.ts`
**Review questions:** Is the assertion about behavior, not implementation trivia?

## Ticket 2: Document Cron Security TODO
Easy, 30 minutes. Add a TODO note in docs or an issue template referencing [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19). Checks: docs spellcheck/manual review.

## Ticket 3: Add Duplicate Slug Content Validation
Easy, 1 hour. Extend [`scripts/validate-content.ts:6-29`](../../../scripts/validate-content.ts#L6-L29) to track slugs. Acceptance: duplicate fixture or unit-style check fails.

## Ticket 4: Add Sandbox Result Duration Field
Medium, 1-2 hours. Touch [`src/lib/sandbox/shared.ts:19-31`](../../../src/lib/sandbox/shared.ts#L19-L31), [`src/features/lessons/code-exercise.tsx:89-110`](../../../src/features/lessons/code-exercise.tsx#L89-L110), and tests. Risk: browser/Node harness divergence.

## Ticket 5: Improve Empty Catalog Result
Easy, 45 minutes. Add an empty state in [`src/features/catalog/catalog-client.tsx:74-79`](../../../src/features/catalog/catalog-client.tsx#L74-L79). Check manually or component test.

## Ticket 6: Add Test For Streak Same-Day Activity
Easy, 30 minutes. Extend [`tests/unit/gamification.test.ts`](../../../tests/unit/gamification.test.ts) around [`src/lib/gamification.ts:49-53`](../../../src/lib/gamification.ts#L49-L53).

## Ticket 7: Add Content Estimated Minutes Field
Medium, 2 hours. Update Zod schema [`src/lib/content-schema.ts:80-86`](../../../src/lib/content-schema.ts#L80-L86), content JSON, seed if needed, and course/lesson UI. Risk: migration if persisted.

## Ticket 8: Add Review Queue Empty State Link
Easy, 30 minutes. Update [`src/features/review/review-session.tsx:37-43`](../../../src/features/review/review-session.tsx#L37-L43) with link to catalog. Check type/lint.

## Ticket 9: Add Course Language Filter Test Plan
Easy docs ticket. Write a component test plan for [`src/features/catalog/catalog-client.tsx:39-47`](../../../src/features/catalog/catalog-client.tsx#L39-L47).

## Ticket 10: Add Prisma Schema Comments
Easy, 45 minutes. Add brief comments for ReviewState fields in [`prisma/schema.prisma:124-143`](../../../prisma/schema.prisma#L124-L143). Risk: avoid noise.

## Ticket 11: Add Server-Derived Correctness Design Note
Easy docs ticket. Reference [`src/features/review/review-session.tsx:57-66`](../../../src/features/review/review-session.tsx#L57-L66) and [`src/server/review.ts:79-90`](../../../src/server/review.ts#L79-L90). Acceptance: design note includes tests.

## Ticket 12: Add `npm run db:reset` Script
Easy, 30 minutes. Add script that runs Prisma reset/seed. Risk: destructive command naming must be explicit.

## Ticket 13: Add Health Route Stub
Medium, 1 hour. Add `/api/health` returning app status, no secrets. Tests optional route handler test.

## Ticket 14: Improve Auth README Section
Easy, 45 minutes. Expand [`README.md`](../../../README.md) with provider setup and demo mode warning.

## Ticket 15: Add Review Session Keyboard Shortcuts
Medium, 2 hours. Add key handlers to [`src/features/review/review-session.tsx`](../../../src/features/review/review-session.tsx). Risk: accessibility and accidental grading.

## Ticket 16: Add Course Content Lint For Hidden Tests
Medium, 2 hours. Validation script ensures each CODE item has at least one visible test. Anchor [`src/lib/content-schema.ts:31-43`](../../../src/lib/content-schema.ts#L31-L43).

## Ticket 17: Add Unit Test For Concept Strength Bounds
Easy, 30 minutes. Test [`src/lib/srs/scheduler.ts:69-74`](../../../src/lib/srs/scheduler.ts#L69-L74). Acceptance: always 0-100.

## Ticket 18: Add Profile No-Badges CTA
Easy, 30 minutes. Update [`src/app/profile/page.tsx`](../../../src/app/profile/page.tsx). Avoid over-designing.

## Ticket 19: Add Playwright Locator Comments
Easy docs/test cleanup. Explain why role locators are used in [`tests/e2e/happy-path.spec.ts:5-25`](../../../tests/e2e/happy-path.spec.ts#L5-L25).

## Ticket 20: Add Risk Register Entry For Demo User
Easy docs ticket. Reference [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21).
