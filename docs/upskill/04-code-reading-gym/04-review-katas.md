# 04 Review Katas

## Kata 1: "Trust Review Correctness From Client"
**Author intent:** Award less XP for wrong reviews.
**Fake diff summary:** Server action accepts `correct` and blindly uses it for rewards.
**Files this resembles:** [`src/features/review/review-session.tsx:59-70`](../../../src/features/review/review-session.tsx#L59-L70), [`src/server/review.ts:79-91`](../../../src/server/review.ts#L79-L91)
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

## Kata 2: "Hide The Continue Button When The Lesson Is Done"
Blocking: hiding the button is not the rule. The invariant that a finished lesson pays no XP lives in the server action's repeat branch at [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40); a UI-only change leaves the action callable and the invariant untested.
Important: Any PR that touches repeat-credit needs a test asserting XP, streak, and quest progress are all unchanged on the second call.
Optional: Add clearer empty state copy.

## Kata 3: "Award XP Directly From The New Feature"
**Fake diff summary:** A new feature calls `prisma.progress.update({ data: { xp: { increment: 25 } } })` instead of going through the award pipeline.
Blocking: [`awardActivity`](../../../src/server/gamification.ts#L61-L123) is the single write path for progress. Bypassing it skips the XP event, the streak update, quest advancement, and achievement unlocks, so the ledger and the ring disagree.
Important: Ask whether the new activity needs its own `ActivityKind` in [`src/lib/gamification.ts:3`](../../../src/lib/gamification.ts#L3) rather than an ad-hoc number.
Optional: Name the XP constant instead of inlining 25.

## Kata 4: "Move Scheduler Into Server Action"
Blocking: reduces testability and swappability. Anchor pure scheduler [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74).
Important: Keep domain algorithm pure.

## Kata 5: "Store Course Progress In LocalStorage"
Blocking: durable progress belongs in the database even when the database is a local file. Anchor LessonCompletion [`prisma/schema.prisma:193-203`](../../../prisma/schema.prisma#L193-L203). Zustand stores here hold transient UI state only — see [`src/store/review-store.ts`](../../../src/store/review-store.ts) for what that boundary looks like when it is drawn correctly.
Important: Progress in `localStorage` cannot be reset by `resetProgressAction`, cannot be read by the XP ledger, and disappears with the browser profile.

## Kata 6: "Replace Zod With Type Assertions"
Blocking: Type assertions do not validate JSON. Anchor [`src/lib/content-schema.ts:66-90`](../../../src/lib/content-schema.ts#L66-L90).
Important: Keep validation script in CI.

## Kata 7: "Remove Worker Timeout"
Blocking: infinite loops can hang execution. Anchor [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).
Important: Browser runner must terminate worker.

## Kata 8: "Simplify The Seed By Deleting The Module Tree First"
**Fake diff summary:** Replaces the position-key upserts with `deleteMany` then `create`, because it is shorter.
Blocking: content ids would change on every re-seed, and `LessonCompletion`, `ReviewState`, and `Attempt` all point at them by id. The existing code says so explicitly at [`prisma/seed.ts:28-33`](../../../prisma/seed.ts#L28-L33) — a re-seed after this change cascade-deletes the learner's entire history.
Important: If the tree really must be rebuilt, the PR owes a migration for existing progress and a test that survives two consecutive seeds.

## Kata 9: "Add Achievement Rule In DB Text"
Important: Achievements are declarative data evaluated in code — see the definitions at [`src/lib/gamification.ts:260-334`](../../../src/lib/gamification.ts#L260-L334) and `earnedAchievementKeys` at [`src/lib/gamification.ts:335`](../../../src/lib/gamification.ts#L335). Moving the rule into a DB text column trades a typechecked predicate for an expression evaluator you now have to make safe.

## Kata 10: "Query All Review States"
Blocking if unbounded: current query caps `take: 20` at [`src/features/review/queries.ts:23-24`](../../../src/features/review/queries.ts#L23-L24). Preserve pagination/backpressure.

## Kata 11: "Catch And Ignore Sandbox Errors"
Important: UI currently displays errors in [`src/features/lessons/code-exercise.tsx:59-61`](../../../src/features/lessons/code-exercise.tsx#L59-L61). Swallowing errors makes debugging impossible.

## Kata 12: "Let The Client Pass The User Id"
**Fake diff summary:** A new action takes `userId` as an input field "so it can be reused later", instead of calling `getCurrentUser()`.
Blocking: identity is derived server-side from [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40), and that is the one property that makes the current single-user shortcut safely removable. Accepting a client-supplied `userId` turns "there is only one user" from an assumption into a hole.
Important: The argument "it is local anyway" is exactly the argument that makes the code unsafe to ever deploy. Say so in the review.

## Review Rubric

- Blocking: correctness, security, data loss, broken invariants.
- Important: maintainability, testability, reliability, unclear ownership.
- Optional: style, naming, polish when behavior is safe.
