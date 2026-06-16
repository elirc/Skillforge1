# 01 Code Review Mindset

Review layers:
1. Does it work?
2. Is it correct?
3. Will it stay correct?
4. Does it fit the codebase?
5. Is it kind to future maintainers?

## Repo-Specific Checklist

- Does a server mutation validate input with Zod like [`src/server/actions.ts:10-15`](../../../src/server/actions.ts#L10-L15)?
- Does it derive user server-side through [`src/server/user.ts:4-22`](../../../src/server/user.ts#L4-L22)?
- Does user-owned data filter by user like [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49)?
- Is pure logic tested like [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44)?
- Does untrusted code stay in worker path [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35)?
- Are DB invariants supported by unique constraints or indexes?

## Good Review Comments

> This looks directionally right. I think the blocking issue is ownership: the client currently sends a correctness flag, but rewards are anti-gaming sensitive. Can we derive correctness in `gradeReviewItem` for MCQ/cloze and add one malicious-input test?

> Small maintainability ask: this duplicates the review item branch already in the lesson player. Could we either share a helper or document why the review experience intentionally differs?

> Non-blocking: the naming here says "sync", but the function also creates the weekly league. A name like `upsertWeeklyLeaderboardEntry` would make the side effect clearer.
