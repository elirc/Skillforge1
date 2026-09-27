# UPDATE — handoff notes for whoever continues this work

Read this first if you are an LLM (or a person) taking over mid-task. It says
what the app is, what the current improvement pass is doing, what is done, and
what is left. Keep it current: when you finish or abandon a workstream, edit the
status table below before you stop.

## The user's request (2026-09-24)

> improve the app more, mostly use Opus but use Fable to plan first, add more
> content, you will run out of usage so keep a doc in a new file called update
> where you will give the needed context for a different LLM to take over when
> you run out.

Later: "finish, use multiple opus agents".

Nothing has been committed in this pass. The user did not ask for commits, so
leave changes in the working tree unless they ask.

## What the app is (60-second version)

Skillforge is a local-only, single-learner coding trainer (Next.js 16 App
Router, React 19, Prisma + SQLite at `data/skillforge.db`, Tailwind 4,
Zustand, TanStack Query, Vitest, Playwright). There is no auth; the one learner
row has id `"local"`. See `README.md` for scripts and architecture.

- Content is authored as files under `content/` and seeded into SQLite by
  `prisma/seed.ts` (via `scripts/lib/content.ts`). Never author content in the DB.
- Lessons: `content/<course>/<NN-module>/<NN-lesson>/lesson.json` with
  `contentBlocks` (prose | code-example | callout) and `knowledgeItems`
  (MCQ | CLOZE | CODE). CODE items reference an exercise trio
  `<key>.starter.ts|cs`, `<key>.solution.ts|cs`, `<key>.tests.ts`.
- Problems: `content/problems/<slug>/problem.json` + the same trio.
- Schema for all of it: `src/lib/content-schema.ts`.
- `npm run validate:content` runs every reference solution against its tests
  (C# needs the runner built with `npm run csharp:build`; .NET 10 SDK is
  installed on this machine).
- Gamification engine (pure): `src/lib/gamification.ts`. Write path:
  `src/server/gamification.ts`. Feed/"Next up": `src/server/feed.ts`.
- `docs/upskill/08-reference/risk-register.md` and
  `docs/upskill/06-contribution-practice/02-mid-level-feature-tickets.md`
  list known weaknesses; several workstreams below come from there.

## State of the tree when this pass began

Uncommitted work from an earlier session was already present and is kept:
`src/server/completion.ts` (transactional lesson completion),
`tests/unit/completion.test.ts`, `scripts/test-completion-local.mjs`,
`astraupskill/` (a study course about that change), and edits threading a
transaction `client` through `src/server/{gamification,quests,review,actions}.ts`.

`node_modules` was missing; `pnpm install` was run in this pass.

## Content inventory at start

| Area | Count at start |
| --- | --- |
| javascript-foundations | 28 lessons |
| typescript-starter | 13 lessons |
| csharp-dotnet-interview-prep | 15 lessons, only 3 with runnable C# exercises |
| javascript-patterns | 4 lessons |
| python-thinking | 1 lesson |
| SQL course | none, although the feed ranks `sql` second for most goals |
| problems | 391 (218 EASY, 169 MEDIUM, only 4 HARD); many are templated near-duplicates |

## Plan for this pass (planned by Fable, executed by parallel Opus agents)

Each workstream owns a disjoint set of files so agents can run concurrently.

| # | Workstream | Owns | Status |
| --- | --- | --- | --- |
| 1 | Server-derived review correctness + transactional grading | `src/server/review.ts`, `gradeReviewAction` in `src/server/actions.ts`, `src/features/review/*`, new `src/lib/grading.ts`, tests | done |
| 2 | C# course: runnable exercises for lessons that only have MCQ/CLOZE, plus a new module | `content/csharp-dotnet-interview-prep/` | done |
| 3 | New SQL Foundations course (reading + MCQ/CLOZE + JS exercises that model queries over arrays) | new `content/sql-foundations/` | done |
| 4 | Expand JavaScript Patterns (async/promises, closures, classes, modules-style patterns) and Python Thinking (MCQ/CLOZE only; no Python runtime) | `content/javascript-patterns/`, `content/python-thinking/` | done |
| 5 | Hand-written HARD and MEDIUM problems with real explanations | new dirs under `content/problems/` only | done |
| 6 | Features: concept mastery page, progress export/import, more achievements, lesson-player markdown-lite rendering and hints | `src/app/mastery/`, `src/features/mastery/`, `src/features/profile/*`, `src/app/profile/page.tsx`, `src/lib/gamification.ts` (achievements only), `src/components/site-shell.tsx` (nav link), `src/features/lessons/lesson-player.tsx`, tests | done |
| 7 | TypeScript Starter exercises + extra TS content | content/typescript-starter/, content/problems/ts-hard-*, ts-craft-* | done |
| 8 | Review-by-tag filter + e2e spec update | src/app/reviews, src/features/review/queries.ts, mastery links, tests/e2e | done |
| 13 | Python/JS Patterns/TS additions | content/python-thinking/, content/javascript-patterns/, content/typescript-starter/ (appended modules) | done |

Rules every workstream follows:

- Do not run `db:reset`, `db:seed`, or `db push` against `data/skillforge.db`
  (it holds the learner's real progress). Tests that need a DB use a temp
  SQLite file, as `scripts/test-completion-local.mjs` does.
- Do not commit.
- Content must pass `npm run validate:content`. Exercise functions are
  self-contained; only `import type` from `@content/_authoring/types`.
- Starter files must compile but fail tests; solutions must pass all tests.

## Verification to run when all workstreams finish

```bash
npm run lint
npm run typecheck
npm test
npm run validate:content
node scripts/test-completion-local.mjs
npm run build
```

After that, the learner applies new content with `npm run db:seed` (safe:
progress survives re-seeds; see README).

## Where things stand (end of this pass)

All eight workstreams are done, verified, and uncommitted. New content has been
seeded into `data/skillforge.db`; a pre-seed backup is at
`data/skillforge.backup-2026-09-24.db` (git-ignored). The learner's progress
was checked before and after the seed and is unchanged.

| Area | Before | After |
| --- | --- | --- |
| csharp-dotnet-interview-prep | 15 lessons, 3 exercises | 18 lessons, 18 exercises |
| sql-foundations | none | 20 lessons, 20 exercises |
| javascript-patterns | 4 lessons | 16 lessons, 16 exercises |
| typescript-starter | 13 lessons, 6 exercises | 25 lessons, 25 exercises |
| python-thinking | 1 lesson | 10 lessons (MCQ/CLOZE only) |
| problems | 391 (4 HARD) | 431 (25 HARD) |
| achievements | 8 | 18 |

Final verification, run one command at a time by the coordinator on 2026-09-24:

| Check | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npx vitest run --maxWorkers=2` | 71 passed, 13 skipped (DB suites run via the scripts below) |
| `node scripts/test-completion-local.mjs` | 9/9 pass |
| `node scripts/test-backup-local.mjs` | 4/4 pass |
| `npm run validate:content` | 6 courses, 106 lesson exercises (26 C#), 431 problems |
| `npm run build` | pass |
| `npm run db:seed` | 6 courses, 117 lessons, 431 problems |
| `npm run test:e2e` (on a DB copy) | 1/1 pass |

Machine note: this PC ran with about 0.3 GB free RAM. Running several heavy
commands at once got a background job killed. Run heavy checks one at a time.

## Suggested next work (not started)

- **Real SQL grading** with in-browser SQLite (sql.js) and result-set comparison.
- **Stable content ids.** Content identity is still position-based; reordering
  lessons re-points review history. See Ticket 7 in
  `docs/upskill/06-contribution-practice/02-mid-level-feature-tickets.md`.
  This needs a schema change, so back up `data/skillforge.db` first.
- **E2E in CI.** Add `test:e2e` to `.github/workflows/ci.yml` against a seeded copy.
- **Prune templated problems.** Many older `js-easy-*`, `ts-medium-*`,
  `react-*-*` problems are near-duplicates. Deleting them also deletes the
  learner's submissions for them, so ask the user first.
- Commit the work once the user asks; it is currently one large uncommitted diff.

## Log

- 2026-09-24: Explored repo, wrote this plan, installed deps (pnpm install), built the C# runner, and launched six parallel Opus agents, one per workstream. If a workstream row still says "planned" or "in progress" when you take over, its agent did not finish: check `git status` for its files and continue from there.
- 2026-09-24 (workstream 2, done): C# course now has a runnable C# exercise in all 18 lessons. Added 12 exercises to modules 02-05 (complete-lesson-endpoint, grade-review-policy, find-captive-dependencies, choose-index, outbox-relay, diagnose-missing-reviews, plan-test-layers, build-log-event, triage-incident, keyset-page, cache-aside, resolve-config), each with 5-6 visible and 2-3 hidden tests; appended 2 MCQ/CLOZE + the CODE item to each of those lessons (existing items untouched, appended only) and added prose/code/callout blocks. New module `06-crud-api-end-to-end/` (DTOs+validation, paging/filter/sort, ETags+idempotent POST) with exercises create-product, list-products, etag-idempotency. course.json outcomes/topicTags updated. Verified: typecheck clean, eslint clean on the course dir, validate:content passes (6 courses, 87 lesson exercises, 20 C#); every new starter compiles and fails its tests. README "Not built yet > Wider C# coverage" is now stale (outside this workstream).
- 2026-09-24 (workstream 3, done): New `content/sql-foundations/` course (slug `sql-foundations`, language `sql`, BEGINNER, order 3 -- course order is not unique in the schema; it shares 3 with python-thinking). 6 modules, 20 lessons, each with prose/code-example(sql, some csharp)/callouts, one CODE exercise, and 3 MCQ/CLOZE items (60 total, single-blank CLOZE only because the lesson player grades blanks[0]). Exercises model SQL semantics over arrays of rows and each prompt names the clause it mirrors: select-where, page-products, select-distinct, where-not-in, display-names, summarize-payments, top-customers, inner-join-orders, orders-per-customer, employees-with-managers, running-totals, deactivate-stale-accounts, upsert-inventory, check-constraints, normalize-orders, seek-prefix-length, run-transaction, detect-anomalies, build-user-query, find-repeated-queries. Verified: every solution passes and every starter fails its tests; validate:content passes (6 courses, 87 lesson exercises, 22 C#, 407 problems); typecheck clean; eslint clean on the course dir. Learner needs `npm run db:seed` to see it.
- 2026-09-24 (workstream 4, done): JavaScript Patterns grew from 4 to 16 lessons. Existing modules 01-02 untouched; appended modules 03-closures-and-higher-order-functions (run-counter, memo-stats, debounce-fires), 04-async-javascript (log-order, simulate-await, retry-plan), 05-classes-and-encapsulation (account-log with #private fields/getter, run-repo in-memory repository), 06-immutable-state (replay-todos: fix a mutating reducer so history snapshots stay correct; normalize-posts), 07-iterators-and-generators (range-array, first-multiples). The sandbox harness calls the function synchronously and JSON-compares the return value (promises are not awaited), so async exercises are deterministic models of scheduling, Promise.all vs sequential awaits, and backoff; classes are driven by command-list functions returning plain data. Each new lesson: prose + code-example(s) + callout, 3 MCQ/CLOZE + 1 CODE. Python Thinking grew from 1 to 10 lessons in 4 modules (truthiness, f-strings, lists/tuples, dicts/sets, comprehensions, default/keyword args incl. mutable-default trap, enumerate/zip, exceptions, classes/dataclasses), 4 MCQ/CLOZE each, python code-examples, no CODE items; lesson 01 unchanged. MCQ prompts are single-line because the lesson player renders prompts in an <h3> without preserved whitespace; CLOZE items have one blank. Both course.json files updated (description/outcomes/topicTags). Verified: every new solution passes and every starter fails; validate:content passes (6 courses, 87 lesson exercises, 22 C#, 408 problems); typecheck clean; eslint clean on content/javascript-patterns. Learner needs `npm run db:seed`.
- 2026-09-24 (workstream 1, done): Review correctness is now server-derived. New pure grader `src/lib/grading.ts` (MCQ exact trimmed match; CLOZE case/whitespace-insensitive per blank, string, comma-separated string, or string[]; CODE self-reported: anything but "again"). `gradeReviewItem(input, { client?, now?, beforeCommit? })` in `src/server/review.ts` loads the knowledge item, ignores any client `correct`, forces "again" to incorrect, and wraps reschedule + attempt + `awardActivity` in one `$transaction`. The SQLite-busy retry was extracted from `completion.ts` into `src/server/db-retry.ts` (`withSqliteBusyRetry`), used by both. `gradeReviewAction` keeps `correct` optional-but-unused and returns AwardSummary + `{ correct, expected }`; `review-session.tsx` no longer sends `correct` and shows the server verdict for the last card in the sidebar. Tests: `tests/unit/grading.test.ts`, DB-backed `tests/unit/review-grading.test.ts` (run by `node scripts/test-completion-local.mjs`, which now runs both DB test files). Risk register rows closed. Verified: typecheck, lint, vitest (64 passed, 12 DB tests skipped by design), DB script 9/9 passed.
- 2026-09-24 (workstream 5, done): Added 30 hand-written problems under `content/problems/` (orders 50001-50030; no existing problem dirs touched). HARD (16): migration-run-order, json-patch-apply-atomic, assign-meeting-rooms, cheapest-shipping-route, parse-csv-records, evaluate-price-formula, debounce-with-max-wait, vector-clock-siblings, merge-duplicate-contacts, stale-response-reducer, common-free-slots, parse-nested-query-string (TS runtime), plus C# runtime csharp-hard-optimistic-concurrency-merge, csharp-hard-outbox-dispatch, csharp-hard-inventory-allocation, csharp-hard-di-lifetime-validation. MEDIUM (14): lru-cache-operations, token-bucket-limiter, diff-list-to-ops, autocomplete-top-k, undo-redo-editor, opaque-cursor-pagination, lww-field-merge, effective-permissions, replay-account-events, format-receipt-lines (TS runtime), plus C# runtime csharp-medium-regional-sales-report, csharp-medium-idempotent-requests, csharp-medium-validation-pipeline, csharp-medium-customers-left-join. Each has specific beginner/junior explanations, 6-8 visible and 2-4 hidden tests; every starter compiles and fails, every solution passes. Verified: validate:content passes (6 courses, 87 lesson exercises, 26 C#, 421 problems); typecheck clean; eslint clean on the new dirs. HARD count is now 20. Learner needs `npm run db:seed`.
- 2026-09-24 (workstream 6, done): Concept mastery page `/mastery` (nav link "Mastery"): pure aggregation in `src/lib/mastery.ts`, queries in new `src/server/mastery.ts`; `getWeakConcepts` moved there and is re-exported from `feed.ts` (same output). Shows every tag grouped by course with strength band, reviewed-card count, due count, review links, and "new" tags from completed lessons not yet reviewed. Progress backup (Ticket 4): pure schema/serialize/map in `src/lib/backup.ts` (format `skillforge-progress` v1, keyed by course slug + module/lesson/item order, problem slug, achievement key), DB read/write in `src/server/backup.ts` (import REPLACES inside one `$transaction`, skips and counts entries whose content is gone), actions in `src/server/backup-actions.ts`, UI `src/features/profile/progress-backup.tsx` on `/profile` with an in-page replace confirmation. `next.config.ts` now sets `experimental.serverActions.bodySizeLimit: "25mb"` so large backups can be imported. Achievements: 10 new (hard-mode, quarter-shelf, problem-grinder, memory-palace, month-of-fire, century-shelf, problem-centurion, total-recall, hard-hitter, level-twenty) plus a new `hardProblemsSolved` stat in `collectAchievementStats`; seeded by `db:seed` from the definitions. Lesson player: markdown-lite (`src/lib/markdown-lite.ts`, React elements only, no dangerouslySetInnerHTML) for prose/callouts/prompts, callouts colored by tone, language label on code examples, MCQ explanation after a correct answer, "Reveal answer" after two misses. Tests: `tests/unit/{mastery,backup,markdown-lite}.test.ts`, more achievement cases in gamification.test.ts, DB-backed `tests/unit/backup-db.test.ts` run by `node scripts/test-backup-local.mjs` (temp SQLite). Verified: typecheck, lint, vitest (64 passed, DB suites skipped by design), backup DB script 4/4, completion DB script 9/9, `npm run build` passes.
- 2026-09-24 (coordinator): All six workstreams reported done, each with its own passing typecheck/lint/tests/validate:content (and build, for workstream 6). README updated for grading, mastery, backup, new scripts, and remaining gaps. The coordinator's own combined verification run was stopped by Claude Code during `npm run lint` because the machine ran low on memory, so it produced no results. **Next step for whoever continues:** run the "Verification to run" commands above one at a time and fix anything that fails.
- 2026-09-24 (workstream 8, done): `/reviews?tag=<tag>` filters the due queue to cards carrying that concept tag (pure helpers in `src/lib/review-filter.ts`: `normalizeTagParam`, `filterByConceptTag`, `reviewTagHref`; `getReviewQueue(tag)` filters in JS before the 20-card cap). Page shows a "Filtered to #tag · Clear" chip and a "Nothing due for #tag" empty state linking to the full queue. `/mastery` rows now have a per-tag "Drill due" link and the dashboard's "Shakiest concepts" entries link to `/reviews?tag=...`. Review store is keyed by the queue (card ids) so a new filter starts at card 1; `ReviewSession` now snapshots its queue (grading revalidates /reviews and the shrinking list used to skip cards) and "Restart queue" loads the latest due list. `tests/e2e/happy-path.spec.ts` updated for the new lesson player (aria-pressed, MCQ explanation, two misses -> "Reveal answer"), the server verdict, the tag filter and `/mastery`. Its `beforeEach` DELETES this lesson's LessonCompletion + ReviewState rows for learner `local` in whatever DATABASE_URL points at (default `data/skillforge.db`) and the run writes attempts/XP there, so run it against a copy: stop any server on :3000 (the config reuses an existing server), `cp data/skillforge.db data/skillforge-e2e.db`, then `DATABASE_URL="file:../data/skillforge-e2e.db" npm run test:e2e` (path is relative to `prisma/`; the shell var wins over `.env` for both `next dev` and the spec). The copy must be seeded (JavaScript Foundations lesson "Variables Hold Values" present). Verified: eslint on changed files, `vitest run tests/unit/review-filter.test.ts` (7 passed); Playwright, typecheck and build not run (low memory).
- 2026-09-24 (workstream 7, done): TypeScript Starter now has a CODE exercise in every lesson (13 -> 25 lessons, 6 -> 25 exercises). Added exercises to the 7 lessons that had none (award-xp, letter-grade, longest-streak, leaderboard, monthly-price, paginate, count-tags) plus 1-2 appended MCQ/CLOZE per lesson in modules 01-05 (existing items untouched, appended only; CODE last in the 7 lessons). New modules 06-type-guards-and-validation (filter-users, parse-product with an asserts function, describe-notifications with never), 07-generics-in-practice (latest-per-id, sort-by, collect-results), 08-utility-and-mapped-types (resolve-settings, dirty-state, parse-event-name with as const/template literal/satisfies), 09-typing-a-crud-client (to-create-todo-dto, interpret-response, validate-signup); each lesson has prose, a typescript code-example, callouts, 3 MCQ/CLOZE (single-line MCQ prompts, one blank per CLOZE) and one CODE item. course.json description/topicTags/outcomes updated. 10 problems (orders 60001-60010): HARD ts-hard-event-emitter-dispatch-log, ts-hard-nested-schema-validator, ts-hard-di-container-resolution, ts-hard-query-builder-sql, ts-hard-safe-json-path-get; MEDIUM ts-craft-deep-merge-arrays, ts-craft-state-machine-transitions, ts-craft-deep-diff-paths, ts-craft-discriminated-reducer, ts-craft-result-pipeline. Verified (low-memory mode, only this workstream): every solution passes and every starter fails via runCodeInNodeWorker; tsc --noEmit clean on these files; eslint clean. Full validate:content/typecheck/build not run by this agent (coordinator runs them). README "Not built yet > TypeScript Starter" bullet is now stale (outside this workstream). Learner needs `npm run db:seed`.
- 2026-09-24 (coordinator, final): Ran every check one at a time (table above), all green. Seeded the real DB after backing it up, confirmed progress unchanged, ran e2e on a copy (pass after restarting a dev server that served one spurious 404 right after `next build`). README updated.
- 2026-09-24 (workstream 13, done): Appended modules only; no existing directory or item changed. **Python Thinking** 10 -> 19 lessons (MCQ/CLOZE only, python/bash code-examples, 5-6 items each): 05-modules-and-environments (modules/imports/`__name__`, venv and pip), 06-files-and-iteration (with/pathlib file I/O, iterators/generators/yield, Counter/defaultdict/deque), 07-functions-that-scale (decorators, type hints and mypy), 08-testing-and-a-small-app (pytest basics, CLI todo app walkthrough). **JavaScript Patterns** 16 -> 20 lessons: 08-errors-and-events (import-rows: ValidationError class + result objects; run-emitter: on/off/once with snapshot emit), 09-composition-patterns (checkout-totals: strategy tables injected into a factory; run-pipeline: fix a pipe that was really compose, configured steps, unknown steps as results). **TypeScript Starter** 25 -> 29 lessons: 10-classes-and-enums (run-inventory: private/readonly class with validation; apply-order-events: transition table keyed by an as const literal union), 11-type-system-in-the-real-world (declaration merging/module augmentation, MCQ-heavy, plus merge-interfaces modelling the compiler; describe-scores for strictNullChecks/noUncheckedIndexedAccess). Each new CODE lesson has 4-7 MCQ/CLOZE + 1 CODE, 6 visible + 1-2 hidden tests; TS exercises avoid enums/parameter properties in exercise code because learners see transpiled JS. All three course.json files: description, topicTags, outcomes appended. Verified: `tsc --noEmit` on a temp tsconfig over the three course dirs + content/_authoring clean; `npx eslint content/javascript-patterns content/typescript-starter` clean; a scoped checker (same rules as scripts/check-content.ts plus courseSeedSchema.parse of each full course and exercise-key uniqueness) passes: all 8 new solutions pass, every starter fails 4-8 tests. `scripts/check-content.ts` itself could not run: first it hit another agent's half-written C# lesson dirs, then it ran out of memory (it loads every course and all problems). Learner needs `npm run db:seed`.
