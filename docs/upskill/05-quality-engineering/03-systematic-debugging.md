# 03 Systematic Debugging

Method:
1. Reproduce.
2. Narrow: layer A or layer B?
3. Hypothesize.
4. Test cheaply.
5. Fix root cause.
6. Add regression coverage.

## Scenario: Lesson Completion Does Not Show Reviews
**Reproduction:** Complete a lesson, visit `/reviews`, queue is empty.
**First question:** Is the bug in completion write or review query?
**Narrowing path:**
1. Check server action in [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24).
2. Check ReviewState rows seeded by [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37).
3. Check due query filter in [`src/features/review/queries.ts:8-9`](../../../src/features/review/queries.ts#L8-L9).
**Useful probes:** Prisma Studio, DB query log, temporary server log.
**Likely root causes:** wrong lesson id, no KnowledgeItems, dueAt in future, user mismatch.
**Regression test:** integration test for `completeLessonAction`.
**Senior lesson:** trace durable state first, UI second.

## Scenario: Infinite Code Exercise Hangs
**First question:** Is timeout firing?
**Narrowing path:** Check [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15), then mirror test [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).
**Likely root causes:** worker not created, timeout cleared too early, browser bundling issue.

## Scenario: Streak Jumps Unexpectedly
**First question:** Is date gap calculation correct?
**Narrowing path:** Inspect [`src/lib/gamification.ts:29-60`](../../../src/lib/gamification.ts#L29-L60), reproduce with fixed dates, add unit test.
**Likely root causes:** timezone, DST, server clock, repeated same-day activity.

## Scenario: Course Content Seed Fails
**First question:** Is JSON invalid or reference solution failing?
**Narrowing path:** Run `npm run validate:content`; inspect [`scripts/validate-content.ts:9-23`](../../../scripts/validate-content.ts#L9-L23).
**Likely root causes:** schema mismatch, function name mismatch, expected value shape.

## Scenario: Review Grading Gives Wrong Due Date
**First question:** Is recall score mapped correctly?
**Narrowing path:** Check UI score buttons [`src/features/review/review-session.tsx:117-129`](../../../src/features/review/review-session.tsx#L117-L129), action schema [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41), scheduler tests [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).

## Scenario: Auth User Looks Like Demo User
**First question:** Did Auth.js return a session?
**Narrowing path:** Inspect [`src/server/user.ts:4-22`](../../../src/server/user.ts#L4-L22), provider config [`src/lib/auth.ts:7-21`](../../../src/lib/auth.ts#L7-L21), env vars.

## Debugging Rubric

- Weak: changes code before reproducing.
- Solid: narrows to one layer and adds a test.
- Strong: identifies invariant, root cause, regression, and observability gap.
