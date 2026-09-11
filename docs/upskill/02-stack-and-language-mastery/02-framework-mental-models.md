# 02 Framework Mental Models

## Next.js App Router

Concept: App Router routes compose server components by default. Client components are opt-in with `"use client"`.

Repo anchors:
- The `/tracks` catalog route is a server component that fetches data and renders a client filter component in [`src/app/tracks/page.tsx:11-24`](../../../src/app/tracks/page.tsx#L11-L24); the dashboard at [`src/app/page.tsx:17-25`](../../../src/app/page.tsx#L17-L25) does the same with five parallel server queries.
- Course route uses `generateMetadata` and dynamic route params in [`src/app/courses/[slug]/page.tsx:17-30`](../../../src/app/courses/%5Bslug%5D/page.tsx#L17-L30).
- Lesson route fetches with Prisma and passes plain data into `LessonPlayer` in [`src/app/courses/[slug]/lessons/[lessonId]/page.tsx:15-51`](../../../src/app/courses/%5Bslug%5D/lessons/%5BlessonId%5D/page.tsx#L15-L51).

Failure modes:
- Fetching DB data from a client component.
- Passing non-serializable values into client components.
- Forgetting dynamic pages that read DB should not be prerendered without a DB; this repo uses `dynamic = "force-dynamic"` in route files such as [`src/app/page.tsx:15`](../../../src/app/page.tsx#L15).

Drill:
- Add a comment-free trace of how `/reviews` gets data from DB to UI using [`src/app/reviews/page.tsx`](../../../src/app/reviews/page.tsx) and [`src/features/review/queries.ts`](../../../src/features/review/queries.ts).

## React State

Concept: Server state comes from queries/actions; local UI state should only hold transient interaction state.

Examples:
- Catalog filter state lives locally in [`src/features/catalog/catalog-client.tsx:30-33`](../../../src/features/catalog/catalog-client.tsx#L30-L33).
- Lesson pass state lives locally in [`src/features/lessons/lesson-player.tsx:24-28`](../../../src/features/lessons/lesson-player.tsx#L24-L28).
- Editor buffers are transient Zustand state in [`src/store/lesson-store.ts`](../../../src/store/lesson-store.ts).
- Review session index is transient Zustand state in [`src/store/review-store.ts`](../../../src/store/review-store.ts).

Failure modes:
- Treating local "passed" state as authoritative. The server action still owns completion.
- Persisting durable progress in localStorage rather than DB.
- Stale closures around `startedAt` or index if review flow becomes more complex.

## Prisma

Concept: Prisma is the persistence boundary. The schema defines durable invariants and indexes. Here it targets SQLite, which changes what the schema can express.

Examples:
- ReviewState uniqueness per learner/item in [`prisma/schema.prisma:118-119`](../../../prisma/schema.prisma#L118-L119).
- LessonCompletion uniqueness in [`prisma/schema.prisma:197`](../../../prisma/schema.prisma#L197).
- Quest uniqueness per learner/day/key in [`prisma/schema.prisma:184`](../../../prisma/schema.prisma#L184) — the constraint that makes the daily rollover safe to call repeatedly.
- Learner scoping on ReviewState lookup in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49).

The SQLite tax: there are no enum types and no scalar lists. Columns like `Course.topicTags`, `KnowledgeItem.conceptTags`, and `ReviewState.state` are plain `String`, with the real type reconstructed by Zod in [`src/lib/enums.ts`](../../../src/lib/enums.ts). Prisma will happily hand you `"BEGINNER"` typed as `string`; nothing in the compiler stops you from comparing it to `"beginer"`.

Failure modes:
- Reading a JSON-encoded column without going through `parseTags`, and getting a string where the UI wants an array.
- Casting a string column with `as Difficulty` instead of parsing it, which moves a runtime bug past the type checker.
- N+1 includes as content grows.
- Multi-write operations without transactions.

## Identity As A Constant

Concept: this app has no authentication layer at all. Identity is not looked up, negotiated, or verified — it is a constant. Understanding a *missing* layer is a real skill: you have to know what would normally be there to see the shape of the hole.

Examples:
- `LOCAL_USER_ID = "local"` and the upsert in [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40). `getCurrentUser()` cannot return null and cannot fail an auth check, because there is no check.
- Every server action calls it rather than accepting a user id from the client: [`src/server/actions.ts:25`](../../../src/server/actions.ts#L25), [`src/server/actions.ts:55`](../../../src/server/actions.ts#L55).
- The seed creates the same row at [`prisma/seed.ts:104-110`](../../../prisma/seed.ts#L104-L110), so a fresh database and a first page load converge on the same state.

What to carry to a codebase that *does* have auth:
- The habit the code keeps is still right: resolve the actor on the server, never accept an actor id from the request body. That line of `actions.ts` would be correct in a multi-user app too.
- The habit the code cannot prove is scoping. `where: { userId }` clauses are everywhere and no test can currently fail if one is dropped.
- Authentication (who is calling) and authorization (may they do this) are different questions. This codebase answers neither, which is legitimate for a local single-user tool — and is exactly the assumption that must be revisited the moment anything is shared.

Failure modes:
- Reading `getCurrentUser()` as "auth" and concluding the app has a session layer. It does not.
- Adding a feature that quietly assumes a second user could exist.

## CodeMirror And Workers

Concept: CodeMirror owns text editing; workers own untrusted execution.

Examples:
- Editor creation in [`src/features/lessons/code-exercise.tsx:25-46`](../../../src/features/lessons/code-exercise.tsx#L25-L46).
- Worker execution in [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35).

Drill:
- Explain why CodeMirror should never directly call `new Function`.
