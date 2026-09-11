# 02 Trace Tables

## UI-To-Server Trace: Complete Lesson

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`lesson-player.tsx:30-34`](../../../src/features/lessons/lesson-player.tsx#L30-L34) | `{ lessonId }` | Client | Event -> server action call | Client can call directly |
| 2 | [`actions.ts:19-25`](../../../src/server/actions.ts#L19-L25) | parsed `{ lessonId: string }` | Server action | Zod parse + `getCurrentUser()` | `lessonId` shape is checked, existence is not |
| 3 | [`actions.ts:27-35`](../../../src/server/actions.ts#L27-L35) | LessonCompletion | DB | Read existing, then upsert | Partial flow if next step fails |
| 4 | [`review.ts:17-37`](../../../src/server/review.ts#L17-L37) | ReviewState[] | Domain service | KnowledgeItems -> due states | Parallel write failure |
| 5 | [`actions.ts:38-40`](../../../src/server/actions.ts#L38-L40) | `AwardSummary` | Server action | Repeat takes `noAwardSummary`, first time takes `awardActivity` | Get this branch wrong and XP is farmable |
| 6 | [`gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123) | Progress, XpEvent, Quest, UserAchievement | Domain service | Award XP/streak, advance quests, unlock achievements | Race risk; not one transaction |

## Persistence Trace: Review Grading

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`review-session.tsx:59-70`](../../../src/features/review/review-session.tsx#L59-L70) | `reviewStateId`, answer, score | Client | UI state -> action input | Client-supplied correctness |
| 2 | [`actions.ts:46-57`](../../../src/server/actions.ts#L46-L57) | parsed grade input | Server action | Zod validation, then `userId` from `getCurrentUser()` | The client names the review state but not the learner |
| 3 | [`review.ts:47-49`](../../../src/server/review.ts#L47-L49) | ReviewState | DB | id + userId lookup | Good IDOR protection |
| 4 | [`scheduler.ts:32-66`](../../../src/lib/srs/scheduler.ts#L32-L66) | next state | Pure library | recall -> dueAt/stability | Simplified algorithm |
| 5 | [`review.ts:65-88`](../../../src/server/review.ts#L65-L88) | update + Attempt | DB | Persist schedule and audit | Needs transaction |

## Identity Trace: Current User

There is no auth layer to trace. Identity is a constant, and the interesting part is how a row appears out of nothing on first run.

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`user.ts:8`](../../../src/server/user.ts#L8) | `LOCAL_USER_ID = "local"` | Constant | — | Every query keys off this one value |
| 2 | [`user.ts:22-27`](../../../src/server/user.ts#L22-L27) | User + nested Progress | Server helper | Upsert, so it never returns null | A read is also a write; there is no "user not found" branch anywhere to test |
| 3 | [`user.ts:34-38`](../../../src/server/user.ts#L34-L38) | `LocalProfile` | Server helper | String columns parsed through `src/lib/enums.ts` with `.catch()` defaults | A bad stored value is silently replaced, not reported |

## Decision Trace: What The Dashboard Shows Next

The closest thing in this codebase to an access decision is a ranking decision. Nothing is gated; something is chosen. Trace [`getNextUp`](../../../src/server/feed.ts#L134-L197) and write down what determines position.

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | [`feed.ts:135-148`](../../../src/server/feed.ts#L135-L148) | `LocalProfile` | Server | Not onboarded -> an item at weight 1000 | A hardcoded weight is an invisible policy |
| 2 | [`feed.ts:150-161`](../../../src/server/feed.ts#L150-L161) | due count | DB | `900 + min(dueCount, 50)` | Why is the cap 50, and what happens at 51? |
| 3 | [`feed.ts:163-174`](../../../src/server/feed.ts#L163-L174) | next lesson | Domain service | Ordered by course/module/lesson, biased by goal | Fixed weight 800 always loses to any due review |
| 4 | [`feed.ts:176-194`](../../../src/server/feed.ts#L176-L194) | recommended problem | Domain service | Weak-tag hit -> 850, otherwise 700 | This is the only weight that moves; it can outrank a lesson |
| 5 | [`feed.ts:196`](../../../src/server/feed.ts#L196) | sorted `NextUpItem[]` | Server | Sort by descending weight | Ties are resolved by insertion order, not by rule |

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
| 4 | [`scripts/lib/content.ts`](../../../scripts/lib/content.ts) | `CourseSeed[]` | Loader | Read `content/` tree | Filesystem shape is part of the contract |
| 5 | [`seed.ts:11-92`](../../../prisma/seed.ts#L11-L92) | Prisma writes | Seed script | Import into SQLite | Content rows are upserted by position key (`course+order`, `module+order`, `lesson+order`) so their ids survive a re-seed — read the comment at [`seed.ts:28-33`](../../../prisma/seed.ts#L28-L33) and work out what deleting instead would cascade into |
