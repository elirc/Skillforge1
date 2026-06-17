# 04 Interview Prep From This Repo

This page turns Skillforge into software engineering interview preparation, including C#/.NET transfer practice for mid-level roles.

For a deeper C#/.NET-specific lab, use [05-csharp-dotnet-interview-lab.md](05-csharp-dotnet-interview-lab.md) after this overview.

## Language And Runtime Questions

Question: Why does this repo use both TypeScript types and Zod schemas?
- Anchor: [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90), [`src/server/actions.ts:10-41`](../../../src/server/actions.ts#L10-L41)
- Junior answer: TypeScript checks code, Zod checks data.
- Mid-level answer: JSON, client input, and DB payloads cross runtime boundaries, so compile-time types are not enough.
- Senior answer: Runtime validation is a contract boundary that limits blast radius, improves error locality, and documents ownership. In .NET, the equivalent is typed DTOs plus model validation/FluentValidation at controller or minimal API boundaries.

Question: Explain async concurrency in this repo.
- Anchor: parallel reads in [`src/features/catalog/queries.ts:6-14`](../../../src/features/catalog/queries.ts#L6-L14), serial writes in [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24).
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
- Anchor: [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24), [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37), [`src/features/review/queries.ts:8-25`](../../../src/features/review/queries.ts#L8-L25).
- Junior: check the UI.
- Mid-level: verify completion row, ReviewState rows, dueAt, and user id.
- Senior: identify transaction gaps, add regression test, add structured logs.

## System Design Questions

Question: Design reliable reminder emails.
- Start from stub: [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).
- Mid-level answer adds cron auth, due query, email provider adapter, and tests.
- Senior answer adds outbox, idempotency, retries, backoff, delivery state, observability, rate limits, rollback.
- .NET mapping: hosted service or Hangfire/Quartz job, EF Core outbox table, transactional enqueue, background worker.

Question: How would you make exercise grading secure?
- Anchor: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76).
- Senior answer distinguishes UI isolation from true security, hidden tests, server-side execution, resource quotas, tenant isolation, and abuse prevention.
- .NET mapping: never execute user code inside ASP.NET request process; isolate in container/job runner with CPU/memory/time limits.

## Code Review Questions

Question: Review a PR that removes `userId` from the ReviewState lookup.
- Anchor: [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49).
- Junior: says it might be unsafe.
- Mid-level: calls out IDOR and asks for permission test.
- Senior: blocks the PR, explains exploit path, requires regression test and audit of similar queries.

## Behavioral Prompts

"Tell me about a time you improved reliability."
- Use project idea: transactional review grading from [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90).
- Strong story structure: risk found, invariant defined, design options, tests, rollout, review feedback.

"Tell me about a time you learned a codebase."
- Use this curriculum: file inventory, system map, flow trace, small test PR.

"Tell me about a disagreement in code review."
- Use server-derived correctness: explain anti-gaming risk kindly and concretely.

## C#/.NET Interview Drill Set

1. Translate Prisma `ReviewState` to an EF Core entity. Which indexes from [`prisma/schema.prisma:141-142`](../../../prisma/schema.prisma#L141-L142) matter?
2. Translate `completeLessonAction` into an ASP.NET Core endpoint plus application service. Where do validation, authorization, transaction, and response mapping live?
3. Translate `scheduleReview` into a C# pure function. What tests from [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44) carry over?
4. Translate the worker sandbox to a .NET architecture. Would you use a background service, container, WASM, or external judge?
5. Explain how `Task.WhenAll` can improve independent reads but hurt dependent writes, using [`src/features/catalog/queries.ts:6-14`](../../../src/features/catalog/queries.ts#L6-L14) and [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24).

## C#/.NET Question Bank: Mid-Level Signal

Question: In ASP.NET Core, where would you put the logic currently in `completeLessonAction`?
- Anchor: [`src/server/actions.ts:14-29`](../../../src/server/actions.ts#L14-L29)
- Junior answer: In the controller endpoint.
- Mid-level answer: The endpoint should validate route/body shape and user identity, then call an application service that owns completion, review seeding, rewards, and transaction boundaries.
- Senior answer: Keep transport thin, put the invariant in an application service, wrap multi-write operations in a transaction or recovery workflow, enforce plan authorization server-side, and emit structured logs for completion count and seeded review count.

Question: What EF Core constraints would protect review state?
- Anchor: [`prisma/schema.prisma:124-143`](../../../prisma/schema.prisma#L124-L143)
- Junior answer: A table with user id and knowledge item id.
- Mid-level answer: A unique index on `(UserId, KnowledgeItemId)` and an index on `(UserId, DueAt)` for due queue lookup.
- Senior answer: Add those indexes, understand query patterns, design migrations carefully, and test duplicate seed attempts plus due queue performance.

Question: How would you use `CancellationToken` in the exercise runner or reminder job?
- Anchor: worker timeout in [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15), cron stub in [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19)
- Junior answer: Pass it to async calls.
- Mid-level answer: Propagate it from HTTP/job boundary into DB/provider calls and enforce timeouts around external work.
- Senior answer: Combine cancellation, timeout, idempotency, retry, and visibility so aborted work can be safely retried or diagnosed.
