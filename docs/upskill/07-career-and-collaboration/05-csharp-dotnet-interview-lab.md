# 05 C#/.NET Interview Lab

This lab turns Skillforge into C#/.NET interview practice for mid-level software engineering roles. Skillforge is a TypeScript/Next/Prisma app, so the point is transfer: identify the same boundaries, invariants, and failure modes you would discuss in ASP.NET Core, EF Core, hosted services, and background workers.

## How To Use This Lab

1. Open the Skillforge anchor.
2. Explain the concept in this repo.
3. Translate it to .NET vocabulary.
4. Answer at junior, mid-level, and senior depth.
5. Write one test or review comment that would prove your judgment.

Strong answers do not pretend this repo is .NET. They say: "In this repo, the boundary is X. In ASP.NET Core, I would model the same boundary as Y."

## Skillforge To .NET Architecture Map

| Skillforge anchor | What it does here | .NET translation | Interview topic |
| --- | --- | --- | --- |
| [`src/server/actions.ts:23-44`](../../../src/server/actions.ts#L23-L44) | Completes a lesson, seeds reviews, awards XP | Minimal API/controller calls `ILessonCompletionService` | Thin controllers, service boundaries |
| [`src/server/review.ts:39-91`](../../../src/server/review.ts#L39-L91) | Grades review, updates schedule, writes attempt, awards XP | `IReviewService.GradeAsync(...)` using EF Core transaction | Consistency, authorization, domain logic |
| [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74) | Pure scheduling algorithm | Pure C# domain service/static method | Testable business logic |
| [`prisma/schema.prisma:106-141`](../../../prisma/schema.prisma#L106-L141) | ReviewState and Attempt schema | EF Core entities with indexes and relationships | Data modeling |
| [`src/lib/content-schema.ts:45-90`](../../../src/lib/content-schema.ts#L45-L90) | Runtime content schema | DTOs plus FluentValidation/data annotations | Contract validation |
| [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | Worker timeout for user code | Isolated process/container/background job with timeout | Resource isolation |
| [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56) | Rolls the daily board at read time; there is no scheduler in this repo | `BackgroundService`, Quartz, or Hangfire *if* you decide scheduled work is warranted | Jobs, retries, outbox -- and when not to have them |
| [`src/server/gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123) | Single write path for all progress | One application service owning the invariant | Consistency, transaction boundaries |
| [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40) | One local learner, id `"local"`, upserted on read | `ClaimsPrincipal` + user service | Where identity enters the system |

## ASP.NET Core Boundary Drill

Skillforge boundary:
- Client calls `completeLessonAction` from [`src/features/lessons/lesson-player.tsx:30-34`](../../../src/features/lessons/lesson-player.tsx#L30-L34).
- Server validates input and derives the learner in [`src/server/actions.ts:19-25`](../../../src/server/actions.ts#L19-L25).
- Server performs writes in [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40).

.NET translation:
- HTTP endpoint: parses route/body, gets user id from `ClaimsPrincipal`, returns status/DTO.
- Application service: verifies the lesson exists, writes completion, seeds review state, awards XP through one write path, and refuses repeat credit.
- EF Core: enforces unique constraints and transaction.

Illustrative fake code, not from this repo:

```csharp
// Illustrative fake code: not from this repo.
app.MapPost("/lessons/{lessonId}/complete", async (
    string lessonId,
    ClaimsPrincipal user,
    ILessonCompletionService service,
    CancellationToken ct) =>
{
    var userId = user.RequireUserId();
    await service.CompleteLessonAsync(userId, lessonId, ct);
    return Results.Ok(new { ok = true });
});
```

Mid-level talking points:
- The endpoint should not accept `userId` in the body.
- The service owns the invariant: completion implies review states exist.
- Use a transaction or recovery strategy for multi-write operations.
- Add tests for duplicate completion (no repeat credit), review-state seeding, and a lesson id that does not exist.

Senior talking points:
- Define the idempotency contract.
- Decide whether rewards are inside the same transaction or eventually consistent.
- Emit structured logs and metrics for completion count, seeded count, and failures.
- Say how you would roll the change out when existing progress rows may be affected, and what you would do if you had no migration history to fall back on.

## EF Core Modeling Drill: ReviewState

Skillforge model:
- ReviewState fields and indexes are in [`prisma/schema.prisma:124-143`](../../../prisma/schema.prisma#L124-L143).
- Attempt audit fields are in [`prisma/schema.prisma:145-159`](../../../prisma/schema.prisma#L145-L159).

Illustrative fake code, not from this repo:

```csharp
// Illustrative fake code: not from this repo.
public sealed class ReviewState
{
    public string Id { get; init; } = default!;
    public string UserId { get; init; } = default!;
    public string KnowledgeItemId { get; init; } = default!;
    public DateTimeOffset DueAt { get; set; }
    public double Stability { get; set; }
    public double Difficulty { get; set; }
    public int Interval { get; set; }
    public int Lapses { get; set; }
    public int Reps { get; set; }
    public DateTimeOffset? LastReviewedAt { get; set; }
    public ReviewLifecycle State { get; set; }
}
```

Illustrative fake EF Core configuration:

```csharp
// Illustrative fake code: not from this repo.
builder.Entity<ReviewState>()
    .HasIndex(x => new { x.UserId, x.KnowledgeItemId })
    .IsUnique();

builder.Entity<ReviewState>()
    .HasIndex(x => new { x.UserId, x.DueAt });
```

Interview answer ladder:
- Junior: "I would create a ReviewState table."
- Mid-level: "I would add a unique index on user/item and a due queue index on user/dueAt."
- Senior: "I would add the indexes, test idempotent seeding, measure due queue lookup, and design migrations/rollback because this table is central to retention."

## Application Service Drill: Review Grading

Skillforge anchor:
- User-scoped review lookup: [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49)
- Schedule update: [`src/server/review.ts:51-77`](../../../src/server/review.ts#L51-L77)
- Attempt write and reward: [`src/server/review.ts:79-91`](../../../src/server/review.ts#L79-L91)

.NET design prompt:
Design `GradeReviewAsync(userId, reviewStateId, response, recallScore, duration, ct)`.

Strong design includes:
- Query by `reviewStateId` and `userId`, not just id.
- Load KnowledgeItem payload if correctness should be server-derived.
- Run scheduler as pure domain code.
- Use EF Core transaction for ReviewState update + Attempt insert.
- Decide whether XP award is transactional or an idempotent follow-up.
- Add tests for IDOR, wrong answer, duplicate attempt, and failed transaction.

Illustrative fake code, not from this repo:

```csharp
// Illustrative fake code: not from this repo.
await using var tx = await db.Database.BeginTransactionAsync(ct);

var state = await db.ReviewStates
    .SingleAsync(x => x.Id == reviewStateId && x.UserId == userId, ct);

var next = scheduler.Schedule(state.ToSnapshot(), recallScore, clock.UtcNow);
state.Apply(next);

db.Attempts.Add(Attempt.Create(userId, state.KnowledgeItemId, response, recallScore, duration));

await db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);
```

Review comment you should be able to write:
> Blocking: this query must include `UserId`. Without it, a caller who learns another review state id could grade or mutate someone else's schedule. Please add a permission regression test.

## Async, Tasks, And Transactions

Skillforge examples:
- Parallel reads: [`src/features/catalog/queries.ts:6-14`](../../../src/features/catalog/queries.ts#L6-L14)
- Ordered writes: [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24)
- Parallel achievement reads: [`src/server/gamification.ts:50-55`](../../../src/server/gamification.ts#L50-L55)

.NET interview framing:
- `Task.WhenAll` is good for independent reads.
- It is not a substitute for a transaction.
- Do not parallelize multiple operations on the same EF Core `DbContext`; EF Core contexts are not designed for concurrent operations.
- Use separate contexts only when the operations are truly independent and you understand consistency tradeoffs.

Question:
When would you use `Task.WhenAll` in a Skillforge .NET rewrite?

Solid answer:
- Use it for independent read models, such as loading catalog courses and completions.
- Avoid it for completion -> review seeding -> reward because those writes have ordering and consistency implications.

## Background Jobs And Outbox

Skillforge starting point -- the absence of one:
- This repo has no cron, no worker, and no queue. Due reviews are counted at read time in [`src/server/feed.ts:150-161`](../../../src/server/feed.ts#L150-L161), and the daily quest board is rolled idempotently on every dashboard load in [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56).
- That is the right call for one learner on one machine. The interview value is being able to say why, and to say what would change the answer. Everything below is the design you would reach for once it does.

.NET translation options:
- `BackgroundService`: built-in hosted service, good for simple workers.
- Quartz/Hangfire: scheduling, retries, dashboard, persistence.
- Queue worker: message-driven, good for scale.
- Outbox table: reliable bridge between database state and external side effects.

Mid-level answer for reminder emails:
1. Query due users.
2. Write notification jobs with an idempotency key.
3. Worker sends emails with retry/backoff.
4. Record delivery status.
5. Expose metrics and logs.

Senior additions:
- Avoid sending email inside the same transaction as user state changes.
- Make jobs idempotent by `(userId, reminderDate, channel)`.
- Add poison-message handling.
- Add rate limiting and provider-failure strategy.

## Auth And Authorization

Skillforge anchors:
- There is no authentication here at all. Identity is the constant `LOCAL_USER_ID = "local"` in [`src/server/user.ts:8`](../../../src/server/user.ts#L8), and [`getCurrentUser()`](../../../src/server/user.ts#L21-L40) upserts that row rather than looking anyone up.
- Identity is nonetheless *derived server-side and never accepted from the caller* -- the property that matters, and the one worth describing in an interview.
- IDOR-safe review lookup: [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49). It filters by `userId` even though only one exists, which is what would make a second learner a schema change rather than an audit.

.NET transfer:
- Authentication: validate who the caller is, usually through cookies/JWT and `ClaimsPrincipal`.
- Authorization: decide whether that caller can access a specific resource.
- Policy-based authorization is useful for roles and tiers.
- Resource-based authorization is needed when ownership matters, such as `ReviewState.UserId == currentUserId`.

Interview warning:
Do not say "I added `[Authorize]`, so it is secure." `[Authorize]` proves the user is authenticated. It does not prove they own the review state or the lesson they are writing against.

## Secure Code Execution In .NET

Skillforge anchors:
- Browser worker timeout: [`src/lib/sandbox/client-runner.ts:11-15`](../../../src/lib/sandbox/client-runner.ts#L11-L15)
- Harness disables some APIs and runs `new Function`: [`src/lib/sandbox/shared.ts:38-57`](../../../src/lib/sandbox/shared.ts#L38-L57)
- Infinite loop test: [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27)

.NET interview answer:
- Never execute untrusted learner code inside the ASP.NET Core web process.
- Use an isolated process, container, WASM runtime, or external judge service.
- Enforce CPU, memory, wall-clock timeout, filesystem, network, and concurrency limits.
- Treat timeout as availability protection, not full security.
- Hide server-side tests if assessment integrity matters.

## Mid-Level Mock Interview Set

### Question 1: Design `CompleteLessonAsync`
**Expected mid-level answer includes:**
- Validate `lessonId`.
- Derive `userId` from claims.
- Verify the lesson exists.
- Upsert completion.
- Seed ReviewState idempotently.
- Award XP/streak.
- Use transaction or recovery design.
- Test duplicate completion: the second call must write no XP, no streak change, and no quest progress.

### Question 2: Explain EF Core indexes for reviews
**Expected mid-level answer includes:**
- Unique `(UserId, KnowledgeItemId)` prevents duplicate state.
- `(UserId, DueAt)` supports due queue.
- Attempt has `UserId, CreatedAt` for audit/history.
- Migrations need rollback and performance thought.

### Question 3: Debug missing reviews after completion
**Expected mid-level answer includes:**
- Check completion row.
- Check KnowledgeItems for lesson.
- Check ReviewState rows for same user.
- Check dueAt and query filter.
- Check transaction/logs.

### Question 4: Review a PR that sends emails in the HTTP request
**Expected mid-level answer includes:**
- External side effects can fail independently.
- Use outbox or background job.
- Make email idempotent.
- Add observability.

### Question 5: Explain cancellation tokens
**Expected mid-level answer includes:**
- Accept `CancellationToken` at HTTP/job boundary.
- Pass it to EF Core and external service calls.
- Combine with explicit timeouts for untrusted or long-running work.
- Do not use cancellation as a substitute for idempotency.

## "Tell Me About A Time" Prompts

Use these repo-grounded stories in behavioral interviews.

Prompt: "Tell me about a time you improved security."
- Story source: IDOR-safe review lookup in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49) and proposed server-derived correctness.
- Strong answer: You noticed client-supplied authority, moved trust to server, added malicious-input tests, and explained the blast radius.

Prompt: "Tell me about a time you improved reliability."
- Story source: non-transactional review grading in [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90).
- Strong answer: You identified partial-write risk, proposed EF Core transaction/outbox, and added regression coverage.

Prompt: "Tell me about a time you learned a new codebase."
- Story source: Skillforge docs and key flows.
- Strong answer: You started with file inventory, found route -> service -> schema boundaries, traced one user flow, then made a small test-first contribution.

## Self-Grading Rubric

Weak:
- Names ASP.NET Core or EF Core but cannot map it to a real flow.
- Says "use a service" without explaining what the service owns.
- Says "add a transaction" without naming which writes are protected.

Solid:
- Maps route/controller, application service, EF Core model, and tests to a Skillforge flow.
- Identifies validation and authorization separately.
- Discusses indexes and query patterns.

Strong:
- Separates confirmed repo evidence from design recommendations.
- Includes cancellation, transaction, idempotency, retries, observability, and rollback where relevant.
- Can write a kind but blocking review comment with a concrete test request.
