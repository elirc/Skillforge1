# 04 Side Effects, Async, And Reliability

## Side Effect Map

| Side effect | Anchor | Reliability question |
| --- | --- | --- |
| Completion write | [`src/server/actions.ts:18-22`](../../../src/server/actions.ts#L18-L22) | Is it idempotent? Yes, via `upsert`. |
| ReviewState seeding | [`src/server/review.ts:20-36`](../../../src/server/review.ts#L20-L36) | What if one item write fails? |
| Progress update | [`src/server/gamification.ts:11-22`](../../../src/server/gamification.ts#L11-L22) | Could concurrent updates lose XP? |
| Leaderboard sync | [`src/server/gamification.ts:29-48`](../../../src/server/gamification.ts#L29-L48) | Is weekly identity stable? |
| Achievement unlock | [`src/server/gamification.ts:50-68`](../../../src/server/gamification.ts#L50-L68) | Are badge rules deterministic and idempotent? |
| Attempt logging | [`src/server/review.ts:79-88`](../../../src/server/review.ts#L79-L88) | Should attempt write be in same transaction as schedule update? |
| Reminder cron | [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19) | Where are retries, auth, and delivery logs? |
| Worker execution | [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15) | Does timeout always terminate runaway code? |

## Reliability Concepts

Idempotency:
- `upsert` in LessonCompletion and ReviewState seeding means repeated lesson completion should not duplicate rows: [`src/server/actions.ts:18-22`](../../../src/server/actions.ts#L18-L22), [`src/server/review.ts:22-34`](../../../src/server/review.ts#L22-L34).

Retries:
- No explicit retry mechanism exists. For email reminders, production should record delivery attempts and retry with backoff.

Outbox pattern:
- If reminder emails become real, write a `NotificationOutbox` row inside the same transaction as due-count computation, then process separately. Do not send emails inside a request and hope it succeeded.

Timeouts:
- Worker runner enforces a 2s timeout by default in [`src/lib/sandbox/client-runner.ts:9-15`](../../../src/lib/sandbox/client-runner.ts#L9-L15). Unit coverage exists in [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).

Backpressure:
- Review queue caps at 20 due items in [`src/features/review/queries.ts:23-24`](../../../src/features/review/queries.ts#L23-L24). That helps UI but does not solve reminder scale.

## Risky Places To Investigate

- Concurrent XP awards can race because progress is read then updated with absolute values in [`src/server/gamification.ts:5-22`](../../../src/server/gamification.ts#L5-L22).
- Multi-write review grading has no explicit transaction in [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90).
- Cron route returns stubbed delivery without persistence in [`src/app/api/cron/reviews/route.ts:11-18`](../../../src/app/api/cron/reviews/route.ts#L11-L18).

## Drill

Choose one side effect and design:
- idempotency key,
- retry policy,
- failure visibility,
- rollback or compensation.
