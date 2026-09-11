# 05 Pattern Catalog

## Pattern: Server Action Boundary
**Problem it solves:** Keeps mutations on the server while allowing client components to invoke them.
**General shape:** Client submits minimal input; server validates, derives user, performs domain work, revalidates paths.
**Real example:** [`src/server/actions.ts:19-44`](../../../src/server/actions.ts#L19-L44)
**Second example:** [`src/server/actions.ts:46-61`](../../../src/server/actions.ts#L46-L61)
**Why this implementation works:** Zod validates shape and `getCurrentUser` derives the learner server-side, so no client can name a user id.
**Failure modes:** Non-transactional writes, trusting client correctness, forgetting the repeat-credit branch so an activity can be farmed.
**Use it when:** A user action changes durable state.
**Avoid it when:** The work is purely local UI state.
**Drill:** Add a fake server action for changing the daily XP goal and list its validation rules. Compare your answer with the real one in [`src/server/actions.ts:78-85`](../../../src/server/actions.ts#L78-L85).

## Pattern: Pure Domain Function
**Problem it solves:** Makes business rules easy to test without DB.
**General shape:** Accept plain input, return plain output, no side effects.
**Real example:** [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74)
**Second example:** [`src/lib/gamification.ts:124-156`](../../../src/lib/gamification.ts#L124-L156) — `applyStreak` takes `now` as an argument rather than reading the clock, which is the whole reason streak behavior is testable.
**Failure modes:** Hidden time dependency, mutation of inputs, DB import sneaking in.
**Use it when:** Rules have meaningful edge cases.
**Avoid it when:** Logic is just a thin persistence call.
**Drill:** The achievement rules in [`src/lib/gamification.ts:260-334`](../../../src/lib/gamification.ts#L260-L334) are already declarative data. Add one more definition on paper and name the `AchievementStats` field it would need.

## Pattern: Prisma Unique Idempotency
**Problem it solves:** Repeated operations do not duplicate rows.
**General shape:** Add unique constraint; write with `upsert`.
**Real example:** [`prisma/schema.prisma:202`](../../../prisma/schema.prisma#L202) plus [`src/server/actions.ts:27-36`](../../../src/server/actions.ts#L27-L36)
**Second example:** [`prisma/schema.prisma:123`](../../../prisma/schema.prisma#L123) plus [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37)
**Failure modes:** Upsert hides invalid repeated requests; no transaction around adjacent writes.
**Use it when:** Replays are expected or harmless.
**Avoid it when:** A repeat should be *visible*, not absorbed — note that lesson completion checks for an existing row **before** upserting, precisely so the repeat can be detected and denied XP.
**Drill:** Read the uniqueness the daily quest board already has, `@@unique([userId, day, key])` at [`prisma/schema.prisma:189`](../../../prisma/schema.prisma#L189), and explain what `ensureTodaysQuests` would do wrong without it.

## Pattern: User-Scoped Query
**Problem it solves:** Keeps every read and write addressed to a learner rather than to a bare row id.
**General shape:** Query by resource id **and** current user id.
**Real example:** [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49)
**Second example:** [`src/features/review/queries.ts:8-9`](../../../src/features/review/queries.ts#L8-L9)
**Why it is here at all:** There is exactly one learner, so this guard can never fire today. It is kept because it costs nothing and it is the seam a second user would need. A codebase that drops the `userId` filter "because there is only one" has to find every query again later.
**Failure modes:** Scoping in UI only; passing a `userId` that came from the client instead of from `getCurrentUser()`.
**Use it when:** Reading or mutating learner-owned data.
**Avoid it when:** Reading catalog content, which belongs to no one.
**Drill:** Find a query in `src/server/` or `src/features/` that touches learner data without a `userId` filter, and say whether that is a bug or a deliberate global read.

## Pattern: Content As Data
**Problem it solves:** Courses can be authored and validated outside UI code.
**General shape:** Store structured JSON, validate with schema, import into DB.
**Real example:** [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json)
**Second example:** [`prisma/seed.ts:11-92`](../../../prisma/seed.ts#L11-L92), fed by the loader in [`scripts/lib/content.ts`](../../../scripts/lib/content.ts) and validated by [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts)
**Failure modes:** Schema drift, destructive seed behavior, hidden tests shipped to client.
**Use it when:** Non-code domain content changes often.
**Avoid it when:** Content needs rich runtime components.
**Drill:** Add a required `estimatedMinutes` field on paper and list all touched files.

## Pattern: Discriminated Union Renderer
**Problem it solves:** Safely render different item types.
**General shape:** A `type` field narrows payload shape.
**Real example:** [`src/lib/content-schema.ts:45-64`](../../../src/lib/content-schema.ts#L45-L64)
**Second example:** [`src/features/lessons/lesson-player.tsx:87-131`](../../../src/features/lessons/lesson-player.tsx#L87-L131)
**Failure modes:** Missing branch for new type, duplicated logic between lesson/review UIs.
**Use it when:** A finite set of variants has different payloads.
**Avoid it when:** Variants are open-ended plugins.
**Drill:** Sketch a new `predict-output` item type.

## Pattern: Worker Isolation
**Problem it solves:** Keeps untrusted or long-running code off the main thread.
**General shape:** Create worker, post structured request, enforce timeout, terminate.
**Real example:** [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35)
**Second example:** [`src/lib/sandbox/node-runner.ts`](../../../src/lib/sandbox/node-runner.ts)
**Failure modes:** Treating worker as full security sandbox, leaking hidden tests.
**Use it when:** CPU-bound or untrusted code might freeze UI.
**Avoid it when:** Code needs privileged server secrets.
**Drill:** Explain how the timeout test proves liveness but not complete security.

## Pattern: Shared Harness Contract
**Problem it solves:** Browser and test runners execute the same test protocol.
**General shape:** Define request/result types and generate harness source.
**Real example:** [`src/lib/sandbox/shared.ts:3-31`](../../../src/lib/sandbox/shared.ts#L3-L31)
**Second example:** [`tests/unit/sandbox.test.ts:4-28`](../../../tests/unit/sandbox.test.ts#L4-L28)
**Failure modes:** Divergence between browser and Node execution.
**Use it when:** Multiple runtimes need same contract.
**Avoid it when:** Runtime semantics differ too much.
**Drill:** Add a result field `durationMs` and list changes.

## Pattern: Query Projection By Feature
**Problem it solves:** Fetches only what a feature page needs.
**Real example:** [`src/features/catalog/queries.ts:4-20`](../../../src/features/catalog/queries.ts#L4-L20)
**Second example:** [`src/features/review/queries.ts:5-49`](../../../src/features/review/queries.ts#L5-L49)
**Failure modes:** Over-fetching nested data, N+1, coupling UI too tightly to DB shape.
**Use it when:** Route needs composed data.
**Avoid it when:** Public API needs stable DTOs.
**Drill:** Create a DTO for review queue items.

## Pattern: Route-Level Composition
**Problem it solves:** Keeps URL-specific loading near the route.
**Real example:** [`src/app/reviews/page.tsx:8-35`](../../../src/app/reviews/page.tsx#L8-L35)
**Second example:** [`src/app/courses/[slug]/lessons/[lessonId]/page.tsx:15-54`](../../../src/app/courses/%5Bslug%5D/lessons/%5BlessonId%5D/page.tsx#L15-L54)
**Failure modes:** Too much domain logic in route.
**Use it when:** Loading and layout are route-specific.
**Avoid it when:** Logic belongs in a reusable service.
**Drill:** Move no code; just annotate what belongs elsewhere.

## Pattern: Cache Revalidation After Mutation
**Problem it solves:** Server-rendered pages see fresh data after action.
**Real example:** [`src/server/actions.ts:12-17`](../../../src/server/actions.ts#L12-L17) — one helper revalidates `/`, `/tracks`, `/reviews`, `/profile`, and every progress-changing action calls it.
**Second example:** [`src/server/problems.ts:40-42`](../../../src/server/problems.ts#L40-L42), which revalidates its own narrower set by hand.
**Failure modes:** Missing route, overly broad invalidation, stale client store.
**Use it when:** Mutation changes server-rendered data.
**Avoid it when:** Pure client state changes.
**Drill:** `recordProblemSubmissionAction` does not revalidate `/tracks`, but `revalidateProgressSurfaces` does. Decide whether that is a bug, and say which surface would show stale data if it is.

## Pattern: Validation Script In CI
**Problem it solves:** Prevents broken content from shipping.
**Real example:** [`scripts/validate-content.ts:6-29`](../../../scripts/validate-content.ts#L6-L29)
**Second example:** [`.github/workflows/ci.yml:22-28`](../../../.github/workflows/ci.yml#L22-L28), where CI creates the SQLite file, seeds it, and then runs lint, typecheck, content validation, unit tests, and build.
**Failure modes:** Validation not representative of browser runtime.
**Use it when:** Data files contain executable-like contracts.
**Avoid it when:** Validation needs production secrets.
**Drill:** Add validation for duplicate course slugs.

## Pattern: Parse With Fallback At The Storage Edge
**Problem it solves:** Keeps the app runnable when a stored value is missing or no longer valid, without scattering `as` casts.
**General shape:** A schema at the read boundary that supplies a default instead of throwing.
**Real example:** `goalSchema.catch("crud-dev").parse(user.goal)` and the matching `experience` read in [`src/server/user.ts:34-36`](../../../src/server/user.ts#L34-L36)
**Second example:** `parseTags` returning `[]` for malformed JSON in [`src/lib/enums.ts:42-50`](../../../src/lib/enums.ts#L42-L50)
**Why it is needed here:** SQLite has no enums and no scalar lists, so these columns are plain strings that Prisma types as `string`. The compiler will not stop a stale or hand-edited value; only this read does.
**Failure modes:** A silent fallback hides a real data bug — a learner whose goal quietly becomes `crud-dev` and whose feed changes for no visible reason.
**Use it when:** The value is stored, low-stakes, and a sane default is better than a crash.
**Avoid it when:** The wrong value would corrupt progress; then fail loudly instead.
**Drill:** Pick one `.catch()` in the codebase and write the log line or surfaced warning you would add so a silent fallback is at least observable.

## Pattern: Test Around Risk
**Problem it solves:** Places tests where failure would be expensive.
**Real example:** Scheduler tests in [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44)
**Second example:** Sandbox timeout test in [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27)
**Failure modes:** Testing implementation trivia instead of invariants.
**Use it when:** Logic has edge cases or security/reliability implications.
**Avoid it when:** The test only snapshots CSS.
**Drill:** Write a test name for reward race conditions.

## Pattern: Idempotent Bootstrap
**Problem it solves:** Makes a fresh checkout useful immediately, and makes re-running setup safe.
**General shape:** Upsert everything; never insert blindly; separate content rows from progress rows.
**Real example:** [`prisma/seed.ts:135-141`](../../../prisma/seed.ts#L135-L141) — the learner row is upserted with `update: {}`, so `npm run db:seed` refreshes content without touching XP, streak, or review history.
**Second example:** [`getCurrentUser()`](../../../src/server/user.ts#L21-L40), which upserts the same row at request time, so even a database that was never seeded works on first page load.
**Failure modes:** A bootstrap that recreates rows instead of upserting silently erases progress; two places that both "ensure" the same row can drift in what defaults they set.
**Use it when:** Setup must be re-runnable and the first run must not be special.
**Avoid it when:** You actually want a destructive reset — that is `npm run db:reset`, and it is destructive on purpose.
**Drill:** `seedLocalUser` and `getCurrentUser` both create the learner row with a nested `progress: { create: {} }`. Decide whether that duplication is a problem, and what would break if only one of them were updated.
