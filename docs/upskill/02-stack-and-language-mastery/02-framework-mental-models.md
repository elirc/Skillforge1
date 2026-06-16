# 02 Framework Mental Models

## Next.js App Router

Concept: App Router routes compose server components by default. Client components are opt-in with `"use client"`.

Repo anchors:
- Catalog route is a server component that fetches data and renders a client filter component in [`src/app/page.tsx:7-19`](../../../src/app/page.tsx#L7-L19).
- Course route uses `generateMetadata` and dynamic route params in [`src/app/courses/[slug]/page.tsx:17-30`](../../../src/app/courses/%5Bslug%5D/page.tsx#L17-L30).
- Lesson route fetches with Prisma and passes plain data into `LessonPlayer` in [`src/app/courses/[slug]/lessons/[lessonId]/page.tsx:15-51`](../../../src/app/courses/%5Bslug%5D/lessons/%5BlessonId%5D/page.tsx#L15-L51).

Failure modes:
- Fetching DB data from a client component.
- Passing non-serializable values into client components.
- Forgetting dynamic pages that read DB should not be prerendered without a DB; this repo uses `dynamic = "force-dynamic"` in route files such as [`src/app/page.tsx:5`](../../../src/app/page.tsx#L5).

Drill:
- Add a comment-free trace of how `/reviews` gets data from DB to UI using [`src/app/reviews/page.tsx:8-18`](../../../src/app/reviews/page.tsx#L8-L18) and [`src/features/review/queries.ts:5-49`](../../../src/features/review/queries.ts#L5-L49).

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

Concept: Prisma is the persistence boundary. The schema defines durable invariants and indexes.

Examples:
- ReviewState uniqueness per user/item in [`prisma/schema.prisma:141-142`](../../../prisma/schema.prisma#L141-L142).
- LessonCompletion uniqueness in [`prisma/schema.prisma:176-185`](../../../prisma/schema.prisma#L176-L185).
- User scoping on ReviewState lookup in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49).

Failure modes:
- Missing user filters on resource reads.
- N+1 includes as content grows.
- Multi-write operations without transactions.

## Auth.js

Concept: Auth.js handles identity and session persistence; application code still owns authorization decisions.

Examples:
- Providers and Prisma adapter in [`src/lib/auth.ts:7-21`](../../../src/lib/auth.ts#L7-L21).
- Session callback attaches `user.id` in [`src/lib/auth.ts:25-31`](../../../src/lib/auth.ts#L25-L31).
- `getCurrentUser` falls back to demo user in [`src/server/user.ts:4-22`](../../../src/server/user.ts#L4-L22).

Failure modes:
- Confusing authentication with authorization.
- Letting shared guest mode leak into production.

## CodeMirror And Workers

Concept: CodeMirror owns text editing; workers own untrusted execution.

Examples:
- Editor creation in [`src/features/lessons/code-exercise.tsx:25-46`](../../../src/features/lessons/code-exercise.tsx#L25-L46).
- Worker execution in [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35).

Drill:
- Explain why CodeMirror should never directly call `new Function`.
