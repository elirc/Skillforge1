# 06 Architecture Critique

## Strongest Design Choices

1. The review scheduler is isolated as a pure module in [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74), with direct unit tests in [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).
2. Course content has a runtime schema in [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90) and a validation script that executes reference solutions in [`scripts/validate-content.ts:14-23`](../../../scripts/validate-content.ts#L14-L23).
3. User code execution is moved to a worker runner with timeout enforcement in [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35).
4. ReviewState has the right uniqueness and due queue index in [`prisma/schema.prisma:118-119`](../../../prisma/schema.prisma#L118-L119).
5. The code separates pure reward math from DB persistence across [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) and [`src/server/gamification.ts`](../../../src/server/gamification.ts), and funnels every progress write through one function, [`awardActivity`](../../../src/server/gamification.ts#L61-L123).
6. Scope discipline. No auth, no billing, no tenancy, no Docker, no deploy target. Each of those is a subsystem that would need tests, secrets, and failure handling; none of them serve one learner on one machine.

## Confirmed Risks

| Risk | Evidence | Impact | Suggested migration |
| --- | --- | --- | --- |
| ~~Review correctness is client-supplied~~ **Resolved after this chapter was written** | Now derived on the server: [`src/server/review.ts`](../../../src/server/review.ts) `gradeReviewItem` (CODE items re-graded with `gradeCode`, others via `gradeResponse`); the client component says so in a comment ([`review-session.tsx`](../../../src/features/review/review-session.tsx), "the client never decides correctness") | Was: the learner could grade themselves generously and the XP ledger stopped meaning anything | Done as suggested — keep it as a worked example of moving authority to the server |
| Hot paths are not transactional (**review grading and lesson completion now are**: `review.ts` `$transaction`, `completion.ts` `$transaction`; check any remaining path before citing this row) | [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91), [`src/server/gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123) | A failure mid-flow leaves an advanced `ReviewState` with no `Attempt`, or quest progress with no XP event | Wrap in `prisma.$transaction`, as [`resetProgressAction`](../../../src/server/actions.ts#L88-L104) already does |
| XP is read-then-written in places (**the XP write now uses `increment`**, `gamification.ts`; verify `level` derivation before citing) | [`src/server/gamification.ts:41-55`](../../../src/server/gamification.ts#L41-L55) | Concurrent awards from two tabs can lose an increment | Use atomic `increment` consistently, and derive `level` from the returned value |
| Sandbox escapes are denied by deletion, not by isolation | [`src/lib/sandbox/shared.ts:38-42`](../../../src/lib/sandbox/shared.ts#L38-L42) | Removing globals from the harness is a fence, not a wall; a `new Function` body runs with whatever else the worker scope has | Enumerate the worker's real capability surface and document what the sandbox does *not* claim to stop |

## Hypotheses To Investigate

| Hypothesis | Evidence | How to verify |
| --- | --- | --- |
| Progress XP updates can race | Read-then-update in [`src/server/gamification.ts:41-55`](../../../src/server/gamification.ts#L41-L55) | Concurrent award integration test against a scratch SQLite file |
| Review update and attempt log should be transactional | Separate writes in [`src/server/review.ts:65-88`](../../../src/server/review.ts#L65-L88) | Fault-injection test or transaction design |
| Catalog query may over-fetch as courses grow | Nested include in [`src/features/catalog/queries.ts:7-13`](../../../src/features/catalog/queries.ts#L7-L13) | Seed a large catalog and profile query/render |
| Sandbox equality is too naive | JSON stringify comparison in [`src/lib/sandbox/shared.ts:44-46`](../../../src/lib/sandbox/shared.ts#L44-L46) | Add tests for property order, NaN, undefined |
| The dashboard feed re-queries more than it needs | [`src/server/feed.ts:134-198`](../../../src/server/feed.ts#L134-L198) fans out to reviews, lessons, and problems per load | Count queries per dashboard render; consider one pass over `ReviewState` |

## Priority Improvements

1. Integrity of the XP ledger:
   - Make every progress mutation atomic and transactional.
   - Keep `awardActivity` as the only write path; treat any direct `prisma.progress.update` elsewhere as a bug.
   - Test strategy: unit tests on the pure engine in `src/lib/gamification.ts`, plus a concurrency test on the server path.
2. Transactional review writes:
   - Use `prisma.$transaction` for ReviewState update + Attempt insert.
   - Test strategy: integration test against a temporary SQLite database file.
3. Server-derived review correctness:
   - Load the KnowledgeItem payload in `gradeReviewItem`.
   - Compare MCQ/cloze answers server-side.
   - Leave code exercise review as self-recall unless a server runner exists.
4. Content pipeline hardening:
   - Duplicate slug and duplicate knowledge-item id checks in `scripts/validate-content.ts`.
   - Stable content ids so a reseed does not orphan review history.
5. Observability, sized for a local app:
   - Structured logs around server actions and sandbox failures.
   - A visible surface for "what did the seed actually load", since a bad seed is the most common silent failure here.

## If I Owned This For Three Months

Month 1:
- Make the XP ledger trustworthy: atomic increments, transactions, one write path.
- Add DB-backed integration tests over a throwaway SQLite file.

Month 2:
- Improve the content workflow: duplicate slug checks, stable content ids, content versioning, and a reseed that preserves review history.
- Add server-derived correctness and anti-gaming rules.

Month 3:
- Deepen the sandbox: more languages or a real out-of-process runner, with an explicit threat model.
- Performance profiling and pagination for the catalog and the review queue.
- Make the dashboard feed in [`src/server/feed.ts`](../../../src/server/feed.ts) explainable — the learner should be able to ask why an item is ranked first.

## Drill

Pick one recommendation and write a one-page RFC. Include the invariant, how you would apply the schema change with `prisma db push` (there is no migration history to lean on), rollback, tests, and "how we will know it broke."
