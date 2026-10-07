# 04 Side Effects, Async, And Reliability

## Side Effect Map

| Side effect | Anchor | Reliability question |
| --- | --- | --- |
| Completion write | [`src/server/actions.ts:27-36`](../../../src/server/actions.ts#L27-L36) | Is it idempotent? Yes, via `upsert`. |
| ReviewState seeding | [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37) | What if one item write fails? |
| Progress update | [`src/server/gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123) | Could concurrent updates lose XP? |
| Daily quest roll | [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56) | Is the roll idempotent when the day flips mid-session? |
| Quest advance and bonus payout | [`src/server/quests.ts:94-125`](../../../src/server/quests.ts#L94-L125) | Can the same quest pay its bonus twice? |
| Achievement unlock | [`src/server/gamification.ts:183-226`](../../../src/server/gamification.ts#L183-L226) | Are badge rules deterministic and idempotent? |
| Attempt logging | [`src/server/review.ts:79-88`](../../../src/server/review.ts#L79-L88) | Should attempt write be in same transaction as schedule update? |
| Progress reset | [`src/server/actions.ts:88-104`](../../../src/server/actions.ts#L88-L104) | Eight deletes — why is *this* the one flow in a transaction? |
| Worker execution | [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15) | Does timeout always terminate runaway code? |

## Reliability Concepts

Idempotency:
- `upsert` in LessonCompletion and ReviewState seeding means repeated lesson completion should not duplicate rows: [`src/server/actions.ts:27-36`](../../../src/server/actions.ts#L27-L36), [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37).
- `ensureTodaysQuests` upserts by `(userId, day, key)` in [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56), so it is safe to call on every dashboard load and every award. That is what makes "the day rolled over" a non-event.
- Idempotency here is not only about duplicate rows. It is about duplicate *credit*: repeating a finished lesson or a solved problem deliberately skips the award pipeline in [`src/server/actions.ts:38-40`](../../../src/server/actions.ts#L38-L40) and [`src/server/submissions.ts:20-22`](../../../src/server/submissions.ts#L20-L22).

Retries:
- No explicit retry mechanism exists anywhere. Every side effect happens inside the request that triggered it, and if it fails the learner sees it fail. For a single local user that is a defensible choice; write down which of these flows you would be unwilling to lose silently.

Scheduled work:
- There is none. No cron, no worker, no background queue. Anything time-based — the daily quest board, the streak, the review due queue — is computed when something asks for it. The trade is that "what day is it" is evaluated at read time rather than at a fixed tick, which is why `dayKey` and `now` are threaded as parameters through [`src/lib/gamification.ts:97-110`](../../../src/lib/gamification.ts#L97-L110) instead of being read from the clock deep inside.

Timeouts:
- Worker runner enforces a 2s timeout by default in [`src/lib/sandbox/client-runner.ts:9-15`](../../../src/lib/sandbox/client-runner.ts#L9-L15). Unit coverage exists in [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).

Backpressure:
- Review queue caps at 20 due items in [`src/features/review/queries.ts:23-24`](../../../src/features/review/queries.ts#L23-L24). That protects the UI from a backlog of hundreds, but the backlog still exists in the table.

## Risky Places To Investigate

- Concurrent XP awards can race because progress is read and then written back in [`src/server/gamification.ts:41-55`](../../../src/server/gamification.ts#L41-L55). Two tabs is enough to reproduce it.
- Multi-write review grading has no explicit transaction in [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91), while [`resetProgressAction`](../../../src/server/actions.ts#L88-L104) does use one. Ask why the safer pattern is used on the cold path and not the hot one.
- `advanceQuests` in [`src/server/quests.ts:104-127`](../../../src/server/quests.ts#L104-L127) reads a quest, decides `justCompleted`, then updates — and the caller pays the bonus based on that return value. Trace what a concurrent award does to the bonus.

## Drill

Choose one side effect and design:
- idempotency key,
- retry policy,
- failure visibility,
- rollback or compensation.
