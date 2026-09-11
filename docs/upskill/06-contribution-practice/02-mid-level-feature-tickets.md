# 02 Mid-Level Feature Tickets

Mid-level tickets cross layers and require design notes before implementation.

## Ticket 1: Server-Derived Review Correctness
- Layers: review UI, server action, review service, tests.
- Anchors: [`src/features/review/review-session.tsx:59-70`](../../../src/features/review/review-session.tsx#L59-L70), [`src/server/review.ts:39-91`](../../../src/server/review.ts#L39-L91).
- Design notes: how to grade MCQ/cloze from the stored `KnowledgeItem` payload, what to do for code items, impact on existing `Attempt` rows.
- Rollback: keep the old input accepted but ignored.
- Tests: a request asserting `correct: true` on a wrong answer, a wrong answer, a right answer.

## Ticket 2: Goal-Aware Feed Weights
- Layers: profile/onboarding, `src/server/feed.ts`, dashboard UI, tests.
- Anchors: [`src/server/feed.ts:11-20`](../../../src/server/feed.ts#L11-L20), [`src/server/feed.ts:134-197`](../../../src/server/feed.ts#L134-L197).
- Problem: the ranking weights are magic numbers inline in `getNextUp`, so no test can pin the ordering and no learner can see why something is first.
- Design notes: lift the weights into a named, exported table; decide whether `weight` stays a number or becomes a reason plus a number.
- Risk: changing the ordering silently; write the ordering test before the refactor.

## Ticket 3: Transactional Review Grading
- Layers: review service, Prisma transaction, tests.
- Anchors: [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91), and [`resetProgressAction`](../../../src/server/actions.ts#L88-L104) as the in-repo example of the pattern.
- Risk: the transaction API changes return values; `awardActivity` currently runs after these writes and would need a decision about whether it joins the transaction.

## Ticket 4: Progress Export And Import
- Layers: server action, Prisma reads across the learner tables, profile UI, tests.
- Anchors: [`src/server/actions.ts:88-104`](../../../src/server/actions.ts#L88-L104) lists exactly which tables hold learner progress, [`src/app/profile/page.tsx`](../../../src/app/profile/page.tsx), [`src/features/profile/profile-settings.tsx`](../../../src/features/profile/profile-settings.tsx).
- Problem: all progress lives in one SQLite file with no history and no backup. `db:reset` and a destructive `db push` both erase it.
- Design notes: export as JSON keyed by content slug and knowledge-item position, not by cuid, so an import survives a re-seed.
- Risk: an import that double-counts XP. Decide whether import replaces or merges, and say so in the UI.

## Ticket 5: Due-Review Digest
- Layers: `src/server/feed.ts`, dashboard components, tests.
- Anchors: [`src/server/feed.ts:34-58`](../../../src/server/feed.ts#L34-L58), [`src/server/feed.ts:150-161`](../../../src/server/feed.ts#L150-L161).
- Problem: the dashboard says "N cards due" and nothing about *what*. The weak-concept data already exists and is thrown away.
- Design notes: there is no cron and no background worker here — this is computed at read time, so watch the query count per dashboard load.
- Tests: a fixed `now`, a fixed set of `ReviewState` rows, an asserted digest.

## Ticket 6: Catalog Server Pagination
- Layers: query, URL search params, client filters.
- Anchors: [`src/features/catalog/queries.ts:4-20`](../../../src/features/catalog/queries.ts#L4-L20), [`src/features/catalog/catalog-client.tsx:39-47`](../../../src/features/catalog/catalog-client.tsx#L39-L47).
- Risk: losing the simple local-filter UX for a problem the current catalog size does not have yet. Justify the ticket before doing it.

## Ticket 7: Stable Content IDs
- Layers: JSON content, schema, seed, review-state continuity.
- Anchors: [`prisma/seed.ts:28-92`](../../../prisma/seed.ts#L28-L92).
- Current state: content rows are already upserted against position keys (`course+order`, `module+order`, `lesson+order`) so their ids survive a re-seed. The remaining weakness is that *position* is the identity — reordering lessons in a `course.json` silently re-points review history.
- Design notes: an explicit author-supplied stable id in the content schema, and what to do with existing rows.

## Ticket 8: Custom Daily Quests
- Layers: pure engine, quest service, onboarding/profile UI, tests.
- Anchors: [`src/lib/gamification.ts:206-230`](../../../src/lib/gamification.ts#L206-L230), [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56).
- Problem: quest templates are derived from goal and experience only. A learner cannot say "I want two problems a day, not one."
- Design notes: keep `questsForDay` pure; the customization has to arrive as an argument, not be read from the DB inside it.
- Risk: changing the template set mid-day. `ensureTodaysQuests` upserts by `(userId, day, key)` — work out what happens to a partially completed board.

## Ticket 9: Sandbox Hidden Test Redesign
- Layers: content model, client runner, possible server runner.
- Anchors: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76).
- Problem: hidden tests are serialized into the harness the browser executes, so "hidden" means "not displayed", not "not available".
- Risk: server execution cost and a much larger security surface. Say what the sandbox would then have to defend against.

## Ticket 10: Concept Mastery View
- Layers: `src/server/feed.ts`, tracks route, UI, tests.
- Anchors: [`getWeakConcepts`](../../../src/server/feed.ts#L34-L58), [`getTrackProgress`](../../../src/server/feed.ts#L211-L235), [`src/app/tracks/page.tsx`](../../../src/app/tracks/page.tsx).
- Problem: progress is shown per course, but the learner's real question is "which concepts am I weak on", and `conceptStrength` already computes that.
- Design notes: decide whether mastery is derived on every render or cached; watch the nested `include` in `getWeakConcepts`.

## Ticket 11: E2E In CI
- Layers: GitHub Actions, Playwright, seed.
- Anchors: [`.github/workflows/ci.yml:22-28`](../../../.github/workflows/ci.yml#L22-L28), [`playwright.config.ts`](../../../playwright.config.ts), [`tests/e2e/happy-path.spec.ts`](../../../tests/e2e/happy-path.spec.ts).
- Current state: CI already creates and seeds a SQLite file via `db:setup`, then runs lint, typecheck, content validation, unit tests, and build. It does not run `test:e2e`.
- Design notes: no database service container is needed — that is the advantage of SQLite here. The cost is browser install time and flake.
- Risk: flake and CI time; decide whether E2E blocks the merge or runs separately.

## Ticket 12: Review Queue Pagination
- Layers: query, review UI, route state.
- Anchors: [`src/features/review/queries.ts:23-24`](../../../src/features/review/queries.ts#L23-L24).
- Risk: losing continuity within a study session — the Zustand index in [`src/store/review-store.ts`](../../../src/store/review-store.ts) is transient and would need to survive a page of results.
