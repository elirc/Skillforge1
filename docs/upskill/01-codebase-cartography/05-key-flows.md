# 05 Key Flows

## Flow: Catalog Browse And Filter

**Why this flow matters:** It is the first product surface and demonstrates server data fetch plus client-only filtering.

**Open these files first:**
- [`src/app/page.tsx:7-19`](../../../src/app/page.tsx#L7-L19) - route entry and server data handoff.
- [`src/features/catalog/queries.ts:4-20`](../../../src/features/catalog/queries.ts#L4-L20) - data query and completion set.
- [`src/features/catalog/catalog-client.tsx:23-80`](../../../src/features/catalog/catalog-client.tsx#L23-L80) - client filtering.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Server route | `src/app/page.tsx:7-19` | Loads catalog data and passes arrays into client component | `courses`, `completedLessonIds` | Page is dynamic and DB-dependent |
| 2 | Query layer | `src/features/catalog/queries.ts:4-14` | Fetches courses/modules/lessons and user completions in parallel | Prisma Course[] plus Set input | Large catalog may need pagination |
| 3 | Client state | `catalog-client.tsx:30-47` | Applies text/language/topic/difficulty filters | local strings | Filtering is client-only |
| 4 | UI card | `catalog-client.tsx:100-133` | Computes progress and links to course | derived percentage | Progress uses completed lesson ids |

**Validation and authorization:** Current catalog access is public/demo. `getCurrentUser` is called in [`src/features/catalog/queries.ts:5`](../../../src/features/catalog/queries.ts#L5) and may return a shared demo user from [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21).

**Persistence and side effects:** Reads courses and lesson completions only. No writes.

**Tests that cover it:** E2E starts here in [`tests/e2e/happy-path.spec.ts:4-7`](../../../tests/e2e/happy-path.spec.ts#L4-L7).

**What juniors usually miss:**
- The filter is not a server query.
- Course progress is derived in UI, not stored as a CourseProgress row.

**What seniors notice:**
- Future catalog scale may require server-side pagination/search.
- Pro visibility exists, but actual enforcement is not complete.

**Drill:** Add a trace note for where topic tags originate in content and where they render.

**Self-grade:**
- Basic: identify route and component.
- Solid: explain server/client split.
- Strong: identify scale and authorization tradeoffs.

## Flow: Course Page And Lesson Outline

**Why this flow matters:** It shows dynamic route params, SEO metadata, nested Prisma includes, and progress calculation.

**Open these files first:**
- [`src/app/courses/[slug]/page.tsx:17-34`](../../../src/app/courses/%5Bslug%5D/page.tsx#L17-L34)
- [`src/features/catalog/queries.ts:22-40`](../../../src/features/catalog/queries.ts#L22-L40)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Metadata | `page.tsx:17-25` | Fetches course by slug for title/description | Course or null | Duplicate DB fetch with page body |
| 2 | Route | `page.tsx:27-34` | Loads course and derives lesson progress | modules -> lessons -> completions | No transaction needed; read-only |
| 3 | Query | `queries.ts:24-37` | Includes lessons, knowledge items, user completions | nested Prisma result | Nested include grows with course size |
| 4 | UI | `page.tsx:70-94` | Renders modules and lesson links | outline links | Pro indicator is informational only |

**Validation and authorization:** `notFound()` rejects missing slugs in [`src/app/courses/[slug]/page.tsx:29-30`](../../../src/app/courses/%5Bslug%5D/page.tsx#L29-L30). No plan enforcement beyond display.

**Persistence and side effects:** Read-only.

**Tests that cover it:** E2E navigates course and lesson at [`tests/e2e/happy-path.spec.ts:6-7`](../../../tests/e2e/happy-path.spec.ts#L6-L7).

**Drill:** Design where Pro plan enforcement should live. Explain why UI-only gating is insufficient.

## Flow: Lesson Completion Seeds Reviews

**Why this flow matters:** This is the product spine: learning activity becomes reviewable memory work.

**Open these files first:**
- [`src/features/lessons/lesson-player.tsx:22-34`](../../../src/features/lessons/lesson-player.tsx#L22-L34)
- [`src/server/actions.ts:10-29`](../../../src/server/actions.ts#L10-L29)
- [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37)
- [`src/server/gamification.ts:4-26`](../../../src/server/gamification.ts#L4-L26)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Client lesson UI | `lesson-player.tsx:22-28` | Parses blocks/items and tracks passed code checks | Zod-parsed items | Client checks can be bypassed |
| 2 | Client event | `lesson-player.tsx:30-34` | Calls `completeLessonAction` | `{ lessonId }` | Client controls lesson id |
| 3 | Server action | `actions.ts:14-24` | Parses input, gets user, upserts completion, seeds review states, awards XP | server user + lesson id | No explicit transaction |
| 4 | Review seed | `review.ts:17-37` | Creates one ReviewState per KnowledgeItem | due now, NEW | Parallel writes; partial failure risk |
| 5 | Rewards | `gamification.ts:4-26` | Updates Progress, leaderboard, achievements | ProgressSnapshot | Side effects coupled to completion |
| 6 | Cache | `actions.ts:26-28` | Revalidates catalog, reviews, profile | route paths | Missing path causes stale UI |

**Validation and authorization:** Input uses Zod at [`src/server/actions.ts:10-15`](../../../src/server/actions.ts#L10-L15). User is derived server-side at [`src/server/actions.ts:16`](../../../src/server/actions.ts#L16), but the action does not currently verify the lesson belongs to a course the user may access.

**Persistence and side effects:** Writes LessonCompletion, ReviewState, Progress, LeaderboardEntry, UserAchievement. See [`prisma/schema.prisma:124-185`](../../../prisma/schema.prisma#L124-L185) and [`src/server/gamification.ts:37-68`](../../../src/server/gamification.ts#L37-L68).

**Tests that cover it:** E2E exercises lesson completion in [`tests/e2e/happy-path.spec.ts:9-20`](../../../tests/e2e/happy-path.spec.ts#L9-L20). No direct unit test covers transaction behavior.

**What juniors usually miss:**
- Client checks are UX, not security.
- `upsert` makes completion idempotent.

**What seniors notice:**
- Completion, seeding, and rewards should likely be transactional or recoverable.
- Pro-course authorization is a missing production concern.

**Drill:** Write the invariant for this flow: "After a successful lesson completion, every KnowledgeItem in that lesson has exactly one ReviewState for the user."

**Self-grade:**
- Basic: names `completeLessonAction`.
- Solid: traces all writes.
- Strong: proposes transaction and authorization tests.

## Flow: Code Exercise Sandbox

**Why this flow matters:** It is security-critical and shows browser worker isolation plus mirrored Node test execution.

**Open these files first:**
- [`src/features/lessons/code-exercise.tsx:48-62`](../../../src/features/lessons/code-exercise.tsx#L48-L62)
- [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35)
- [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76)
- [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Editor UI | `code-exercise.tsx:25-46` | Creates CodeMirror editor and stores buffer in Zustand | string code | Stale buffer if editor lifecycle changes |
| 2 | Run click | `code-exercise.tsx:48-56` | Sends code/function/tests to worker runner | SandboxRequest | Tests are client-visible for current sample |
| 3 | Worker runner | `client-runner.ts:9-15` | Creates worker and timeout | Promise | Timeout must terminate worker |
| 4 | Harness | `shared.ts:38-49` | Disables some APIs and builds `new Function` | generated JS string | Sandbox is not a formal security boundary |
| 5 | Results | `shared.ts:54-70` | Executes tests and returns structured results | SandboxResponse | JSON equality has edge cases |
| 6 | Unit test | `sandbox.test.ts:16-27` | Infinite loop must time out | rejected promise | Browser worker still needs E2E coverage |

**Validation and authorization:** Request shape is Zod-validated in [`src/lib/sandbox/shared.ts:3-14`](../../../src/lib/sandbox/shared.ts#L3-L14). There is no server authorization because execution is local client-side.

**Persistence and side effects:** No DB writes. Side effect is CPU work in worker.

**Tests that cover it:** Unit tests in [`tests/unit/sandbox.test.ts`](../../../tests/unit/sandbox.test.ts).

**What seniors notice:**
- Disabling `fetch`, `XMLHttpRequest`, `WebSocket`, and `importScripts` helps but does not equal hardened isolation.
- Hidden tests in JSON content are shipped to the client in this architecture.

**Drill:** List three ways to harden this if the platform used paid/proctored exercises.

## Flow: Review Session Grading

**Why this flow matters:** This is the spaced-repetition core and anti-gaming boundary.

**Open these files first:**
- [`src/features/review/queries.ts:5-30`](../../../src/features/review/queries.ts#L5-L30)
- [`src/features/review/review-session.tsx:57-75`](../../../src/features/review/review-session.tsx#L57-L75)
- [`src/server/actions.ts:32-48`](../../../src/server/actions.ts#L32-L48)
- [`src/server/review.ts:39-91`](../../../src/server/review.ts#L39-L91)
- [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Query | `queries.ts:8-25` | Loads due ReviewState records scoped to user | due queue, take 20 | No pagination beyond 20 |
| 2 | UI | `review-session.tsx:57-68` | Determines correctness and sends recall score | answer + score + duration | Client can lie about correctness |
| 3 | Action | `actions.ts:32-43` | Validates score and duration, derives user | parsed input | Correct flag still client supplied |
| 4 | Server domain | `review.ts:47-49` | Fetches ReviewState by id and userId | scoped DB row | Good IDOR guard |
| 5 | Scheduler | `scheduler.ts:32-66` | Computes dueAt, stability, difficulty, interval | SrsReviewState | Algorithm is simplified |
| 6 | Persistence | `review.ts:65-88` | Updates ReviewState and creates Attempt | DB writes | No explicit transaction |
| 7 | Reward | `review.ts:90` | Awards activity XP | Progress update | Rewards rely partly on client correctness |

**Validation and authorization:** Zod validates shape in [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41). User scoping happens in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49).

**Persistence and side effects:** ReviewState update, Attempt insert, Progress/Leaderboard/Achievement updates.

**Tests that cover it:** Scheduler unit tests in [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44); E2E grades one review in [`tests/e2e/happy-path.spec.ts:22-25`](../../../tests/e2e/happy-path.spec.ts#L22-L25).

**What juniors usually miss:**
- `dueAt` is server-derived; client does not send it.
- Correctness and recall score can diverge.

**What seniors notice:**
- Server should derive correctness for MCQ/cloze where possible.
- Attempt creation and ReviewState update should be atomic.

**Drill:** Write a test plan for malicious user A submitting user B's `reviewStateId`.

## Flow: Content Import And Validation

**Why this flow matters:** Course content is code-adjacent data. Bad content can break lessons or exercises.

**Open these files first:**
- [`src/lib/content-schema.ts:3-90`](../../../src/lib/content-schema.ts#L3-L90)
- [`scripts/validate-content.ts:6-29`](../../../scripts/validate-content.ts#L6-L29)
- [`prisma/seed.ts:10-74`](../../../prisma/seed.ts#L10-L74)
- [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Content author | `content/courses/*.json` | Writes course/modules/lessons/items | JSON | Invalid JSON or broken tests |
| 2 | Schema | `content-schema.ts:66-90` | Validates top-level course structure | CourseSeed | Runtime validation only |
| 3 | Validation script | `validate-content.ts:9-20` | Runs every reference solution's tests | SandboxRequest | Only code reference solutions checked |
| 4 | Seed | `seed.ts:15-74` | Upserts course and recreates modules/lessons/items | Prisma writes | Deletes modules for that course |

**Tests that cover it:** CI runs `npm run validate:content` in [`.github/workflows/ci.yml:18-21`](../../../.github/workflows/ci.yml#L18-L21).

**Senior noticing:** Seeding deletes modules with [`prisma/seed.ts:41-42`](../../../prisma/seed.ts#L41-L42). That is acceptable for seed data but dangerous as a production content migration pattern.

## Flow: Cron Review Digest Stub

**Why this flow matters:** Background work is where reliability, authorization, retries, and observability become visible.

**Open these files first:**
- [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19)
- [`prisma/schema.prisma:124-143`](../../../prisma/schema.prisma#L124-L143)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Cron caller | route handler | Calls GET | HTTP request | No auth token check |
| 2 | DB | `route.ts:5-9` | Groups due review states by user | userId + count | Query may scan many due rows |
| 3 | Response | `route.ts:11-18` | Returns stubbed reminders | JSON | No real email, retry, or idempotency |

**Tests that cover it:** No direct coverage found.

**Drill:** Design a minimal auth header check and a unit/integration test for this route.
