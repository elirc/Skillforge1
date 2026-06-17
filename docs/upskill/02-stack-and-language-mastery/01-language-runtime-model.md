# 01 Language Runtime Model

## TypeScript And JavaScript In This Repo

Concept: JavaScript executes in multiple runtimes here: browser UI, Next server/Node, Web Worker, and Node worker tests. TypeScript gives compile-time contracts, but runtime validation still matters at boundaries.

Why it matters in production:
- Browser code cannot read the database.
- Server code must not trust client input.
- Worker code must protect the main thread from infinite loops.
- TypeScript types disappear at runtime, so JSON needs Zod or equivalent validation.

Real code:
- Browser-only components use `"use client"` in [`src/features/lessons/lesson-player.tsx:1`](../../../src/features/lessons/lesson-player.tsx#L1) and [`src/features/review/review-session.tsx:1`](../../../src/features/review/review-session.tsx#L1).
- Server actions validate client input with Zod in [`src/server/actions.ts:10-15`](../../../src/server/actions.ts#L10-L15) and [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41).
- Worker timeout logic terminates runaway code in [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15).
- Node worker tests mirror that behavior in [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27).

Failure modes:
- Assuming `type KnowledgeSeed` protects untrusted DB JSON without parsing.
- Running user code in the main thread.
- Using browser APIs in server components.
- Using `Date` math without thinking about time zones and daylight saving.

Drill:
1. Open [`src/lib/gamification.ts:29-60`](../../../src/lib/gamification.ts#L29-L60).
2. Explain how streak date math works.
3. Identify one date edge case to test.

Self-grade:
- Basic: identifies `Date` usage.
- Solid: explains same-day, next-day, missed-day branches.
- Strong: proposes tests around DST/local day and server time consistency.

## Async And Promise Mental Model

Concept: Async work is either serial because later steps depend on earlier output, or parallel when independent.

Repo examples:
- Catalog fetches courses and completions in parallel in [`src/features/catalog/queries.ts:6-14`](../../../src/features/catalog/queries.ts#L6-L14).
- Lesson completion is serial because completion, review seeding, and reward updates are ordered in [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24).
- Achievement checks use parallel reads in [`src/server/gamification.ts:50-55`](../../../src/server/gamification.ts#L50-L55).

Failure modes:
- Parallelizing dependent writes and creating race conditions.
- Serializing independent reads and increasing latency.
- Forgetting that `Promise.all` rejects on the first failure.

Drill:
- Decide whether `seedLessonReviewStates` should use `Promise.all` as it does in [`src/server/review.ts:20-36`](../../../src/server/review.ts#L20-L36). Write both sides of the argument.

## C#/.NET Transfer

If you are preparing for C#/.NET interviews, map these concepts:
- TypeScript `unknown` + Zod boundary resembles accepting `object`/DTO input and validating with FluentValidation or data annotations before using it.
- `async`/`await` plus `Promise.all` resembles `Task`, `Task.WhenAll`, and careful transaction boundaries.
- Prisma models resemble EF Core entities and migrations.
- Next server actions resemble controller/application-service entry points.

Interview drill:
- Explain why `completeLessonAction` should not trust `lessonId` just because TypeScript says it is a `string` in [`src/server/actions.ts:10-16`](../../../src/server/actions.ts#L10-L16). Then translate the answer to an ASP.NET Core controller receiving a route id.

## C#/.NET Transfer Ladder

Use this ladder when converting Skillforge examples into mid-level .NET interview answers.

| Skillforge concept | .NET equivalent | Interview signal |
| --- | --- | --- |
| Server action validates then mutates state in [`src/server/actions.ts:10-29`](../../../src/server/actions.ts#L10-L29) | Minimal API/controller action calling an application service | You separate transport concerns from domain work. |
| Prisma schema constraints in [`prisma/schema.prisma:124-185`](../../../prisma/schema.prisma#L124-L185) | EF Core model configuration with indexes and unique constraints | You know invariants belong in the database too. |
| Pure scheduler in [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74) | Static/domain service method with deterministic tests | You can isolate business rules from infrastructure. |
| Worker timeout in [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | Background worker/containerized judge with cancellation token and timeout | You protect request threads and user experience. |
| Cron stub in [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19) | `IHostedService`, Quartz, Hangfire, or hosted worker | You discuss retries, idempotency, and observability. |

Mid-level answer shape:
1. Name the boundary.
2. Name the invariant.
3. Name where validation happens.
4. Name where authorization happens.
5. Name the transaction or consistency concern.
6. Name the test that proves it.

Senior answer shape:
1. Include the mid-level answer.
2. Add failure modes, rollback, operational visibility, and migration path.
3. Separate what is confirmed in code from what is a hypothesis.

Drill:
- Translate [`gradeReviewItem`](../../../src/server/review.ts#L39-L91) into an ASP.NET Core application service method. Your answer should include `CancellationToken`, an EF Core query scoped by `userId`, a transaction around schedule update + attempt insert, and a note about deriving correctness server-side.
