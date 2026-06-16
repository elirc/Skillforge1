# 05 Pattern Catalog

## Pattern: Server Action Boundary
**Problem it solves:** Keeps mutations on the server while allowing client components to invoke them.
**General shape:** Client submits minimal input; server validates, derives user, performs domain work, revalidates paths.
**Real example:** [`src/server/actions.ts:10-29`](../../../src/server/actions.ts#L10-L29)
**Second example:** [`src/server/actions.ts:32-48`](../../../src/server/actions.ts#L32-L48)
**Why this implementation works:** Zod validates shape and `getCurrentUser` prevents client-supplied user ids.
**Failure modes:** Missing authorization, non-transactional writes, trusting client correctness.
**Use it when:** A user action changes durable state.
**Avoid it when:** The work is purely local UI state.
**Drill:** Add a fake server action for toggling leaderboard opt-in and list validation rules.

## Pattern: Pure Domain Function
**Problem it solves:** Makes business rules easy to test without DB.
**General shape:** Accept plain input, return plain output, no side effects.
**Real example:** [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74)
**Second example:** [`src/lib/gamification.ts:37-79`](../../../src/lib/gamification.ts#L37-L79)
**Failure modes:** Hidden time dependency, mutation of inputs, DB import sneaking in.
**Use it when:** Rules have meaningful edge cases.
**Avoid it when:** Logic is just a thin persistence call.
**Drill:** Extract one pure helper from a future achievement rule.

## Pattern: Prisma Unique Idempotency
**Problem it solves:** Repeated operations do not duplicate rows.
**General shape:** Add unique constraint; write with `upsert`.
**Real example:** [`prisma/schema.prisma:185`](../../../prisma/schema.prisma#L185) plus [`src/server/actions.ts:18-22`](../../../src/server/actions.ts#L18-L22)
**Second example:** [`prisma/schema.prisma:141`](../../../prisma/schema.prisma#L141) plus [`src/server/review.ts:22-34`](../../../src/server/review.ts#L22-L34)
**Failure modes:** Upsert hides invalid repeated requests; no transaction around adjacent writes.
**Use it when:** Replays are expected or harmless.
**Avoid it when:** Duplicate attempts should be visible as abuse.
**Drill:** Design uniqueness for daily quest completion.

## Pattern: User-Scoped Query
**Problem it solves:** Prevents cross-user resource access.
**General shape:** Query by resource id and current user id.
**Real example:** [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49)
**Second example:** [`src/features/review/queries.ts:8-9`](../../../src/features/review/queries.ts#L8-L9)
**Failure modes:** Scoping in UI only, forgetting nested tenant/org filters.
**Use it when:** Reading or mutating user-owned data.
**Avoid it when:** Reading public catalog content.
**Drill:** Add the missing user/plan check design for lesson completion.

## Pattern: Content As Data
**Problem it solves:** Courses can be authored and validated outside UI code.
**General shape:** Store structured JSON, validate with schema, import into DB.
**Real example:** [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json)
**Second example:** [`prisma/seed.ts:10-74`](../../../prisma/seed.ts#L10-L74)
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
**Real example:** [`src/server/actions.ts:26-28`](../../../src/server/actions.ts#L26-L28)
**Second example:** [`src/server/actions.ts:45-46`](../../../src/server/actions.ts#L45-L46)
**Failure modes:** Missing route, overly broad invalidation, stale client store.
**Use it when:** Mutation changes server-rendered data.
**Avoid it when:** Pure client state changes.
**Drill:** For leaderboard opt-in, list paths to revalidate.

## Pattern: Validation Script In CI
**Problem it solves:** Prevents broken content from shipping.
**Real example:** [`scripts/validate-content.ts:6-29`](../../../scripts/validate-content.ts#L6-L29)
**Second example:** [`.github/workflows/ci.yml:18-21`](../../../.github/workflows/ci.yml#L18-L21)
**Failure modes:** Validation not representative of browser runtime.
**Use it when:** Data files contain executable-like contracts.
**Avoid it when:** Validation needs production secrets.
**Drill:** Add validation for duplicate course slugs.

## Pattern: Feature Flag Stub
**Problem it solves:** Keeps app runnable without external service keys.
**Real example:** Pro indicator in [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65) and env docs in [`README.md`](../../../README.md).
**Second example:** Auth provider fallbacks in [`src/lib/auth.ts:8-15`](../../../src/lib/auth.ts#L8-L15)
**Failure modes:** Stub accidentally treated as production implementation.
**Use it when:** Integration is planned but keys are absent.
**Avoid it when:** Security enforcement is required now.
**Drill:** Define acceptance criteria for real Stripe gating.

## Pattern: Test Around Risk
**Problem it solves:** Places tests where failure would be expensive.
**Real example:** Scheduler tests in [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44)
**Second example:** Sandbox timeout test in [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27)
**Failure modes:** Testing implementation trivia instead of invariants.
**Use it when:** Logic has edge cases or security/reliability implications.
**Avoid it when:** The test only snapshots CSS.
**Drill:** Write a test name for reward race conditions.

## Pattern: Demo Data Bootstrap
**Problem it solves:** Makes a fresh app useful immediately.
**Real example:** [`prisma/seed.ts:117-183`](../../../prisma/seed.ts#L117-L183)
**Second example:** Demo fallback in [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21)
**Failure modes:** Demo behavior leaks into production.
**Use it when:** Onboarding and local demos matter.
**Avoid it when:** Users need isolated anonymous state.
**Drill:** Design a safer guest mode migration path.
