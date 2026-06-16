# 02 Trace Tables

## UI-To-Server Trace: Complete Lesson

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`lesson-player.tsx:30-34`](../../../src/features/lessons/lesson-player.tsx#L30-L34) | `{ lessonId }` | Client | Event -> server action call | Client can call directly |
| 2 | [`actions.ts:10-16`](../../../src/server/actions.ts#L10-L16) | parsed `{ lessonId: string }` | Server action | Zod parse + current user | No entitlement check |
| 3 | [`actions.ts:18-22`](../../../src/server/actions.ts#L18-L22) | LessonCompletion | DB | Upsert | Partial flow if next step fails |
| 4 | [`review.ts:17-37`](../../../src/server/review.ts#L17-L37) | ReviewState[] | Domain service | KnowledgeItems -> due states | Parallel write failure |
| 5 | [`gamification.ts:4-26`](../../../src/server/gamification.ts#L4-L26) | Progress | Domain service | Award XP/streak | Race risk |

## Persistence Trace: Review Grading

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`review-session.tsx:60-68`](../../../src/features/review/review-session.tsx#L60-L68) | `reviewStateId`, answer, score | Client | UI state -> action input | Client-supplied correctness |
| 2 | [`actions.ts:32-41`](../../../src/server/actions.ts#L32-L41) | parsed grade input | Server action | Zod validation | Does not validate ownership yet |
| 3 | [`review.ts:47-49`](../../../src/server/review.ts#L47-L49) | ReviewState | DB | id + userId lookup | Good IDOR protection |
| 4 | [`scheduler.ts:32-66`](../../../src/lib/srs/scheduler.ts#L32-L66) | next state | Pure library | recall -> dueAt/stability | Simplified algorithm |
| 5 | [`review.ts:65-88`](../../../src/server/review.ts#L65-L88) | update + Attempt | DB | Persist schedule and audit | Needs transaction |

## Auth/Permission Trace: Current User

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`auth.ts:18-33`](../../../src/lib/auth.ts#L18-L33) | Auth.js session | Auth layer | Adapter/session callback | Provider keys may be placeholders |
| 2 | [`user.ts:4-9`](../../../src/server/user.ts#L4-L9) | session user | Server helper | ensures progress | Good for signed-in |
| 3 | [`user.ts:11-21`](../../../src/server/user.ts#L11-L21) | demo user | Server helper | fallback upsert | Shared guest risk |

## Error Trace: Infinite User Code

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27) | code with infinite loop | Test | Sends to Node worker | Must not hang test process |
| 2 | [`node-runner.ts`](../../../src/lib/sandbox/node-runner.ts) | Worker | Node | eval harness | Worker thread isolation |
| 3 | [`client-runner.ts:12-15`](../../../src/lib/sandbox/client-runner.ts#L12-L15) | timeout | Browser | terminate worker | Browser behavior not directly tested here |

## Content Import Trace

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json) | JSON | Content author | Course data | Invalid content |
| 2 | [`content-schema.ts:66-90`](../../../src/lib/content-schema.ts#L66-L90) | CourseSeed | Validation | Parse | Schema drift |
| 3 | [`validate-content.ts:16-23`](../../../scripts/validate-content.ts#L16-L23) | SandboxResponse | CI | Execute reference solution | Hidden runtime differences |
| 4 | [`seed.ts:15-74`](../../../prisma/seed.ts#L15-L74) | Prisma writes | Seed script | Import into DB | Deletes module tree |
