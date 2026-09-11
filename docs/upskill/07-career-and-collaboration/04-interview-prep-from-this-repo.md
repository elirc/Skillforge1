# 04 Interview Prep From This Repo

This page turns Skillforge into software engineering interview preparation, including C#/.NET transfer practice for mid-level roles.

For a deeper C#/.NET-specific lab, use [05-csharp-dotnet-interview-lab.md](05-csharp-dotnet-interview-lab.md) after this overview.

## Language And Runtime Questions

Question: Why does this repo use both TypeScript types and Zod schemas?
- Anchor: [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90), [`src/server/actions.ts:19-85`](../../../src/server/actions.ts#L19-L85)
- Junior answer: TypeScript checks code, Zod checks data.
- Mid-level answer: JSON, client input, and DB payloads cross runtime boundaries, so compile-time types are not enough.
- Senior answer: Runtime validation is a contract boundary that limits blast radius, improves error locality, and documents ownership. In .NET, the equivalent is typed DTOs plus model validation/FluentValidation at controller or minimal API boundaries.

Question: Explain async concurrency in this repo.
- Anchor: parallel reads in [`src/features/catalog/queries.ts:15-24`](../../../src/features/catalog/queries.ts#L15-L24), serial writes in [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40).
- C#/.NET mapping: `Promise.all` resembles `Task.WhenAll`; serial awaited writes resemble ordered application-service operations.

## Framework Questions

Question: What belongs in a Next server component vs client component?
- Anchor: [`src/app/page.tsx:7-19`](../../../src/app/page.tsx#L7-L19), [`src/features/catalog/catalog-client.tsx:1-4`](../../../src/features/catalog/catalog-client.tsx#L1-L4).
- Junior: server fetches, client handles clicks.
- Mid-level: durable state and secrets stay server-side; interaction state stays client-side.
- Senior: choose boundaries to minimize data exposure, bundle size, and stale state while preserving UX.
- .NET mapping: Razor/Blazor/server-rendered page vs client-side component; controller/service owns sensitive data.

## Debugging Questions

Question: A learner completes a lesson but sees no reviews. How do you debug?
- Anchor: [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40), [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37), [`src/features/review/queries.ts:8-25`](../../../src/features/review/queries.ts#L8-L25).
- Junior: check the UI.
- Mid-level: verify the completion row, the ReviewState rows, and dueAt.
- Senior: identify transaction gaps, add regression test, add structured logs.

## System Design Questions

Question: This app has no scheduler at all. Everything time-based — the streak, the daily quest board, the review due queue — is computed when something asks. Defend that choice, then design what you would need if reminders had to be delivered.
- Start from what exists: [`ensureTodaysQuests`](../../../src/server/quests.ts#L31-L56) is idempotent and called on every dashboard load, and [`getNextUp`](../../../src/server/feed.ts#L134-L197) counts due reviews at read time.
- Junior answer: "add a cron job."
- Mid-level answer names the trade: compute-at-read is simpler and has no delivery guarantees; a scheduler buys delivery and costs you auth, retries, and a second failure domain. Then adds a due query, a provider adapter, and tests.
- Senior answer explains why *this* codebase is right to have none, and what would change the answer — then designs the outbox, idempotency keys, retries, backoff, delivery state, observability, and rollback for the case where it is warranted.
- .NET mapping: hosted service or Hangfire/Quartz job, EF Core outbox table, transactional enqueue, background worker.

Question: How would you make exercise grading secure?
- Anchor: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76).
- Senior answer distinguishes UI isolation from true security, hidden tests, server-side execution, resource quotas, and abuse prevention. Note that this repo strips `fetch`/`XMLHttpRequest`/`WebSocket`/`importScripts` from the harness at [`src/lib/sandbox/shared.ts:38-42`](../../../src/lib/sandbox/shared.ts#L38-L42) -- a denylist, and a good thing to be asked to critique.
- .NET mapping: never execute user code inside ASP.NET request process; isolate in container/job runner with CPU/memory/time limits.

## Code Review Questions

Question: Review a PR that removes `userId` from the ReviewState lookup.
- Anchor: [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49).
- Junior: says it might be unsafe.
- Mid-level: calls out IDOR and asks for permission test.
- Senior: blocks the PR, explains exploit path, requires regression test and audit of similar queries.

## Behavioral Prompts

"Tell me about a time you improved reliability."
- Use project idea: transactional review grading from [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91).
- Strong story structure: risk found, invariant defined, design options, tests, rollout, review feedback.

"Tell me about a time you learned a codebase."
- Use this curriculum: file inventory, system map, flow trace, small test PR.

"Tell me about a disagreement in code review."
- Use server-derived correctness: explain anti-gaming risk kindly and concretely.

## C#/.NET Interview Drill Set

1. Translate Prisma `ReviewState` to an EF Core entity. Which indexes from [`prisma/schema.prisma:123-124`](../../../prisma/schema.prisma#L123-L124) matter?
2. Translate `completeLessonAction` into an ASP.NET Core endpoint plus application service. Where do validation, authorization, transaction, and response mapping live?
3. Translate `scheduleReview` into a C# pure function. What tests from [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44) carry over?
4. Translate the worker sandbox to a .NET architecture. Would you use a background service, container, WASM, or external judge?
5. Explain how `Task.WhenAll` can improve independent reads but hurt dependent writes, using [`src/features/catalog/queries.ts:15-24`](../../../src/features/catalog/queries.ts#L15-L24) and [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40).

## C#/.NET Question Bank: Mid-Level Signal

Question: In ASP.NET Core, where would you put the logic currently in `completeLessonAction`?
- Anchor: [`src/server/actions.ts:23-44`](../../../src/server/actions.ts#L23-L44)
- Junior answer: In the controller endpoint.
- Mid-level answer: The endpoint should validate route/body shape and user identity, then call an application service that owns completion, review seeding, rewards, and transaction boundaries.
- Senior answer: Keep transport thin, put the invariant in an application service, wrap multi-write operations in a transaction or recovery workflow, keep a single write path for progress so the invariant stays checkable in one place, and emit structured logs for completion count and seeded review count.

Question: What EF Core constraints would protect review state?
- Anchor: [`prisma/schema.prisma:106-125`](../../../prisma/schema.prisma#L106-L125)
- Junior answer: A table with user id and knowledge item id.
- Mid-level answer: A unique index on `(UserId, KnowledgeItemId)` and an index on `(UserId, DueAt)` for due queue lookup.
- Senior answer: Add those indexes, understand query patterns, design migrations carefully, and test duplicate seed attempts plus due queue performance.

Question: How would you use `CancellationToken` in the exercise runner?
- Anchor: worker timeout in [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15), and the Node equivalent in [`src/lib/sandbox/node-runner.ts`](../../../src/lib/sandbox/node-runner.ts), where the timeout is deliberately the budget for the learner's code rather than for the whole call
- Junior answer: Pass it to async calls.
- Mid-level answer: Propagate it from HTTP/job boundary into DB/provider calls and enforce timeouts around external work.
- Senior answer: Combine cancellation, timeout, idempotency, retry, and visibility so aborted work can be safely retried or diagnosed.
