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
1. Check server action in [`src/server/actions.ts:27-36`](../../../src/server/actions.ts#L27-L36).
2. Check ReviewState rows seeded by [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37).
3. Check due query filter in [`src/features/review/queries.ts:8-9`](../../../src/features/review/queries.ts#L8-L9).
**Useful probes:** `npm run db:studio` to open Prisma Studio against `data/skillforge.db`, DB query log, temporary server log.
**Likely root causes:** wrong lesson id, the lesson has no KnowledgeItems, `dueAt` in the future.
**Regression test:** integration test for `completeLessonAction`.
**Senior lesson:** trace durable state first, UI second.

## Scenario: Infinite Code Exercise Hangs
**First question:** Is timeout firing?
**Narrowing path:** Check [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15), then mirror test [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).
**Likely root causes:** worker not created, timeout cleared too early, browser bundling issue.

## Scenario: Streak Jumps Unexpectedly
**First question:** Is date gap calculation correct?
**Narrowing path:** Inspect `applyStreak` in [`src/lib/gamification.ts:124-156`](../../../src/lib/gamification.ts#L124-L156) and the local-day helpers at [`src/lib/gamification.ts:97-110`](../../../src/lib/gamification.ts#L97-L110). Both take dates as arguments, so reproduce with fixed `now` values and add a unit test rather than waiting for midnight.
**Likely root causes:** timezone or DST boundary, a freeze covering a gap you did not expect (there are two, each covers exactly one missed day, and they are never replenished), repeated same-day activity.

## Scenario: Course Content Seed Fails
**First question:** Is JSON invalid or reference solution failing?
**Narrowing path:** Run `npm run validate:content`; inspect [`scripts/validate-content.ts:9-23`](../../../scripts/validate-content.ts#L9-L23).
**Likely root causes:** schema mismatch, function name mismatch, expected value shape.

## Scenario: Review Grading Gives Wrong Due Date
**First question:** Is recall score mapped correctly?
**Narrowing path:** Check UI score buttons [`src/features/review/review-session.tsx:117-129`](../../../src/features/review/review-session.tsx#L117-L129), action schema [`src/server/actions.ts:46-52`](../../../src/server/actions.ts#L46-L52), scheduler tests [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).

## Scenario: XP Was Awarded Twice, Or Not At All
**Reproduction:** Complete the same lesson twice, or re-solve a solved problem, and watch the daily ring.
**First question:** Which branch did the action take?
**Narrowing path:** All progress funnels through [`awardActivity`](../../../src/server/gamification.ts#L61-L123), so start there and work outward. The repeat-credit branches are [`src/server/actions.ts:38-40`](../../../src/server/actions.ts#L38-L40) and [`src/server/problems.ts:37-38`](../../../src/server/problems.ts#L37-L38); the ledger itself is the `XpEvent` table, readable in Prisma Studio.
**Likely root causes:** the "already completed" lookup happened after the upsert rather than before; a bonus paid through `addBonusXp` without a matching `XpEvent`; the daily-XP quest read a stale total.
**Senior lesson:** when a number is wrong, find the single write path before reading any UI code.

## Scenario: The Learner Profile Reset Itself
**First question:** Did a stored enum fall back to its default?
**Narrowing path:** [`getCurrentUser()`](../../../src/server/user.ts#L21-L40) parses `goal` and `experience` with `.catch()` defaults from [`src/lib/enums.ts`](../../../src/lib/enums.ts). An invalid stored string does not throw — it silently becomes `crud-dev` / `beginner`, which then changes the feed and the quest board.
**Useful probes:** read the raw row in Prisma Studio and compare it against the enum schemas.
**Likely root causes:** a hand-edited database, a renamed enum value without a data fix, or a `db push --force-reset` that re-created the row with defaults.

## Debugging Rubric

- Weak: changes code before reproducing.
- Solid: narrows to one layer and adds a test.
- Strong: identifies invariant, root cause, regression, and observability gap.
