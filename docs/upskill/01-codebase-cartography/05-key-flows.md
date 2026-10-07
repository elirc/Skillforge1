# 05 Key Flows

## Flow: Catalog Browse And Filter

**Why this flow matters:** It is the browse surface at `/tracks` and demonstrates server data fetch plus client-only filtering.

**Open these files first:**
- [`src/app/tracks/page.tsx:11-24`](../../../src/app/tracks/page.tsx#L11-L24) - route entry and server data handoff.
- [`src/features/catalog/queries.ts:15-30`](../../../src/features/catalog/queries.ts#L15-L30) - data query and completion set.
- [`src/features/catalog/catalog-client.tsx`](../../../src/features/catalog/catalog-client.tsx) - client filtering.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Server route | `src/app/tracks/page.tsx:11-24` | Loads catalog data and passes arrays into client component | `courses`, `completedLessonIds` | Page is `force-dynamic` and DB-dependent |
| 2 | Query layer | `src/features/catalog/queries.ts:15-30` | Fetches courses/modules/lessons and the learner's completions in parallel | Prisma Course[] plus a Set of lesson ids | A large catalog would eventually need pagination |
| 3 | Decode | `queries.ts:6-13` | Parses the JSON `topicTags`/`outcomes` columns into real arrays | decoded course | SQLite stores these as strings; nothing else in the layer may skip this step |
| 4 | Client state | `catalog-client.tsx` | Applies text/language/topic/difficulty filters | local strings | Filtering is client-only |
| 5 | UI card | `catalog-client.tsx` | Computes progress and links to course | derived percentage | Progress uses completed lesson ids |

**Validation and authorization:** There is none, and that is the design. `getCurrentUser()` at [`src/features/catalog/queries.ts:16`](../../../src/features/catalog/queries.ts#L16) resolves the single local row rather than authenticating anyone; it is there to scope the completions query, not to grant access. Every course is visible to the only learner there is.

**Persistence and side effects:** Reads courses and lesson completions only. No writes.

**Tests that cover it:** E2E starts here in [`tests/e2e/happy-path.spec.ts:4-6`](../../../tests/e2e/happy-path.spec.ts#L4-L6).

**What juniors usually miss:**
- The filter is not a server query.
- Course progress is derived in UI, not stored as a CourseProgress row.
- `decodeCourse` is not cosmetic. Skip it and you get a JSON string where the component expects `string[]`, with no type error to warn you.

**What seniors notice:**
- Future catalog scale may require server-side pagination/search.
- The `where: { userId: user.id }` filter on completions is currently unfalsifiable — there is only one user id — so no test can prove it is correct. That is exactly the kind of clause that rots silently.

**Drill:** Add a trace note for where topic tags originate in content and where they render.

**Self-grade:**
- Basic: identify route and component.
- Solid: explain server/client split.
- Strong: identify scale tradeoffs, and name which query clauses no current test can falsify.

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
| 4 | UI | `page.tsx` | Renders modules and lesson links | outline links | Completion badges are derived, not stored |

**Validation and authorization:** `notFound()` rejects missing slugs. There is no access check beyond that, because there is nothing to gate against — one learner, no plans, no tiers.

**Persistence and side effects:** Read-only.

**Tests that cover it:** E2E navigates course and lesson at [`tests/e2e/happy-path.spec.ts:6-7`](../../../tests/e2e/happy-path.spec.ts#L6-L7).

**Drill:** `getCourseBySlug` runs one query with three levels of nested `include` ([`src/features/catalog/queries.ts:32-51`](../../../src/features/catalog/queries.ts#L32-L51)). Write out the row count it pulls for the largest course in `content/`, then decide which of those includes the page actually renders and which are dead weight. Propose the narrower `select` and say what would break.

## Flow: Lesson Completion Seeds Reviews

**Why this flow matters:** This is the product spine: learning activity becomes reviewable memory work.

**Open these files first:**
- [`src/features/lessons/lesson-player.tsx`](../../../src/features/lessons/lesson-player.tsx)
- [`src/server/actions.ts:23-43`](../../../src/server/actions.ts#L23-L43)
- [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37)
- [`src/server/gamification.ts:60-122`](../../../src/server/gamification.ts#L60-L122)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Client lesson UI | `lesson-player.tsx` | Parses blocks/items and tracks passed code checks | Zod-parsed items | Client checks are UX, not a guarantee |
| 2 | Client event | `lesson-player.tsx` | Calls `completeLessonAction` | `{ lessonId }` | Client supplies the lesson id |
| 3 | Server action | `actions.ts:23-39` | Parses input, resolves the local learner, checks for a prior completion, upserts, seeds review states, awards XP | learner id + lesson id | No explicit transaction |
| 4 | Review seed | `review.ts:17-37` | Creates one ReviewState per KnowledgeItem | due now, `NEW` | Parallel writes; partial failure risk |
| 5 | Rewards | `gamification.ts:60-122` | Applies XP/streak, appends an `XpEvent`, advances quests, unlocks achievements, pays out bonuses | `AwardSummary` | Five sequential writes with no transaction |
| 6 | Cache | `actions.ts:12-17` | `revalidateProgressSurfaces()` revalidates `/`, `/tracks`, `/reviews`, `/profile` | route paths | Missing path causes stale UI |

**Validation and authorization:** Input uses Zod at [`src/server/actions.ts:19-21`](../../../src/server/actions.ts#L19-L21). The learner is resolved server-side at [`src/server/actions.ts:25`](../../../src/server/actions.ts#L25) rather than taken from the client. Note the anti-farming check on line 39: `awardActivity(user.id, "lesson", !existing)` — re-finishing a lesson you already finished still upserts, but pays reduced XP. That is a rule, and rules deserve tests.

**Persistence and side effects:** Writes LessonCompletion, ReviewState, Progress, XpEvent, Quest, UserAchievement. See [`prisma/schema.prisma`](../../../prisma/schema.prisma) and [`src/server/gamification.ts:60-122`](../../../src/server/gamification.ts#L60-L122).

**Tests that cover it:** E2E exercises lesson completion in [`tests/e2e/happy-path.spec.ts:8-19`](../../../tests/e2e/happy-path.spec.ts#L8-L19). No direct unit test covers the multi-write failure behaviour.

**What juniors usually miss:**
- Client checks are UX, not enforcement.
- `upsert` makes the completion row idempotent, but the XP award is not idempotent by itself — the `existing` lookup is what makes it so.

**What seniors notice:**
- Completion, seeding, and rewards should likely be transactional or recoverable. `resetProgressAction` in the same file shows the codebase already knows how to use `prisma.$transaction`; this path just does not.
- The `AwardSummary` returned to the client drives toasts. That means a failed write halfway through can leave the UI celebrating XP the database did not keep.

**Drill:** Write the invariant for this flow: "After a successful lesson completion, every KnowledgeItem in that lesson has exactly one ReviewState for the user."

**Self-grade:**
- Basic: names `completeLessonAction`.
- Solid: traces all writes.
- Strong: proposes a transaction boundary and a test for the "no XP twice" rule.

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

**Validation and authorization:** Request shape is Zod-validated in [`src/lib/sandbox/shared.ts:3-14`](../../../src/lib/sandbox/shared.ts#L3-L14). Execution happens entirely in the learner's own browser worker, on the learner's own machine, so the threat model here is "code that hangs or misbehaves", not "code that attacks another user".

**Persistence and side effects:** No DB writes. Side effect is CPU work in worker.

**Tests that cover it:** Unit tests in [`tests/unit/sandbox.test.ts`](../../../tests/unit/sandbox.test.ts).

**What seniors notice:**
- Disabling `fetch`, `XMLHttpRequest`, `WebSocket`, and `importScripts` helps but does not equal hardened isolation.
- Test cases are shipped to the client, so "hidden tests" are not possible in this architecture. That is fine when the learner and the grader are the same person; it stops being fine the moment a score means something to anyone else.

**Drill:** List three things that would have to change if this same sandbox ever had to grade someone other than the person running it — and identify which of the three the current code already gets right for free.

## Flow: Review Session Grading

**Why this flow matters:** This is the spaced-repetition core, and the place where the client's word is taken for something the server stores.

**Open these files first:**
- [`src/features/review/queries.ts`](../../../src/features/review/queries.ts)
- [`src/features/review/review-session.tsx:57-75`](../../../src/features/review/review-session.tsx#L57-L75)
- [`src/server/actions.ts:45-60`](../../../src/server/actions.ts#L45-L60)
- [`src/server/review.ts:39-92`](../../../src/server/review.ts#L39-L92)
- [`src/lib/srs/scheduler.ts`](../../../src/lib/srs/scheduler.ts)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Query | `queries.ts` | Loads due ReviewState records for the learner | due queue | No pagination on the due queue |
| 2 | UI | `review-session.tsx` | Sends the learner's response and recall score | response + score + duration | (Earlier versions decided correctness here; current code does not) |
| 3 | Action | `actions.ts` `gradeReviewAction` | Validates score and duration, resolves the learner | parsed input | A legacy `correct` field is accepted and ignored |
| 4 | Server domain | `review.ts:47-49` | Fetches ReviewState by id **and** userId | scoped DB row | The scoping is right even though it cannot currently fail |
| 5 | Scheduler | `scheduler.ts` | Computes dueAt, stability, difficulty, interval | SrsReviewState | Algorithm is simplified |
| 6 | Persistence | `review.ts` `gradeReviewItem` | Updates ReviewState and creates Attempt | DB writes | Now inside one `$transaction` with busy retry |
| 7 | Reward | `review.ts` | Calls `awardActivity(..., "review", correct)` | AwardSummary | `correct` is the server's verdict (`gradeCode` / `gradeResponse`) |

**Validation and authorization:** Zod validates shape in [`src/server/actions.ts:45-51`](../../../src/server/actions.ts#L45-L51). Row scoping happens in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49) via `findFirstOrThrow({ where: { id, userId } })`. With one learner that filter can never reject anything — read it as a habit the code keeps rather than a control it enforces.

**Persistence and side effects:** ReviewState update, Attempt insert, then the whole `awardActivity` chain: Progress, XpEvent, Quest, UserAchievement.

**Tests that cover it:** Scheduler unit tests in [`tests/unit/srs.test.ts`](../../../tests/unit/srs.test.ts); E2E grades one review in [`tests/e2e/happy-path.spec.ts:21-25`](../../../tests/e2e/happy-path.spec.ts#L21-L25).

**What juniors usually miss:**
- `dueAt` is server-derived; the client does not send it.
- Correctness and recall score can diverge — you can grade yourself "hard" on an answer you got right.

**What seniors notice:**
- The server has the MCQ/CLOZE payload in `KnowledgeItem` and could derive `correct` itself instead of trusting the field. It does not. Nothing bad happens today, because the only person who could cheat is the person whose learning is at stake — but the shape of the mistake is the same one that matters in a multi-user system.
- Attempt creation and ReviewState update should be atomic.

**Drill:** Trace exactly what a hand-crafted `gradeReviewAction({ correct: true, recallScore: "easy" })` call would change in the database for an item the learner has never seen. Then decide: is trusting the client here a bug, or a correctly-priced trade-off for a local single-user app? Write the argument for whichever side you land on, and name the one change to the product that would flip your answer.

## Flow: Content Import And Validation

**Why this flow matters:** Course content is code-adjacent data. Bad content can break lessons or exercises.

**Open these files first:**
- [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts)
- [`scripts/lib/content.ts`](../../../scripts/lib/content.ts)
- [`scripts/validate-content.ts:25-48`](../../../scripts/validate-content.ts#L25-L48)
- [`prisma/seed.ts:11-61`](../../../prisma/seed.ts#L11-L61)
- [`content/javascript-foundations/`](../../../content/javascript-foundations)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Content author | `content/<course>/**` | Writes `course.json`, `module.json`, `lesson.json`, plus `.starter/.solution/.tests.ts` exercise files | directory tree | Invalid JSON or a broken reference solution |
| 2 | Loader | `scripts/lib/content.ts` | Walks the tree, derives module/lesson order from numeric directory prefixes, and stitches exercise files onto CODE items | assembled course | Order comes from filenames, so a rename reorders the course |
| 3 | Schema | `content-schema.ts` | Validates the assembled course structure | CourseSeed | Runtime validation only |
| 4 | Validation script | `validate-content.ts:25-48` | Executes every reference solution against its own tests, for lesson exercises and standalone problems | SandboxRequest | Only CODE items are executable; prose and MCQ are unchecked |
| 5 | Seed | `seed.ts:11-61` | Upserts the course, then deletes and recreates its modules/lessons/items | Prisma writes | Deletes all modules for that course |
| 6 | Seed | `seed.ts:63-110` | Upserts problems and achievement definitions | Prisma writes | Achievement rows follow `achievementDefinitions` in code |

**Tests that cover it:** CI runs `validate:content` in [`.github/workflows/ci.yml:26`](../../../.github/workflows/ci.yml#L26).

**Senior noticing:** Seeding deletes modules at [`prisma/seed.ts:31`](../../../prisma/seed.ts#L31) and rebuilds them, which means lesson ids are new on every seed. Learner progress is keyed by lesson id, so re-seeding silently orphans completions and review states for any lesson that was rebuilt. The comment on lines 28-30 claims progress survives; read the code and decide whether the comment is telling the truth, and for which lessons.

## Flow: Daily Quest Rollover And The XP Ledger

**Why this flow matters:** This is the closest thing to scheduled background work in the codebase, and it is where idempotency, "what day is it", and derived-versus-stored state all become visible. There is no cron and no worker — the day rolls over because something asks it to.

**Open these files first:**
- [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56)
- [`src/server/quests.ts:94-130`](../../../src/server/quests.ts#L94-L130)
- [`src/server/gamification.ts:86-101`](../../../src/server/gamification.ts#L86-L101)
- [`src/app/page.tsx:19-25`](../../../src/app/page.tsx#L19-L25)

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Trigger | `page.tsx:21`, `gamification.ts:90` | `ensureTodaysQuests` is called on every dashboard load and on every XP award | userId + now | Nothing runs on a timer; a board only appears when the app is opened |
| 2 | Template | `quests.ts:15-25` | Derives today's quest templates from the learner's goal, experience, and daily XP goal | QuestTemplate[] | Changing the profile mid-day rewrites today's targets |
| 3 | Rollover | `quests.ts:31-50` | Upserts one row per template on `(userId, day, key)` | Quest rows | Upsert is what makes repeated calls safe |
| 4 | Prune | `quests.ts:53` | Deletes quest rows older than 30 days | delete count | History is discarded on purpose |
| 5 | Advance | `quests.ts:104-127` | Activity quests increment by one; the XP quest is **set absolutely** from the ledger | progress ints | Incrementing the XP quest would drift from the ring |
| 6 | Payout | `gamification.ts:93-96` | Each newly completed quest writes bonus XP and another `XpEvent` | XP rows | Bonus XP feeds the same ledger the XP quest reads |

**Validation and authorization:** None, and none is needed — no request crosses a trust boundary here. The interesting constraint is the `@@unique([userId, day, key])` index in [`prisma/schema.prisma:184`](../../../prisma/schema.prisma#L184), which is what turns "call this as often as you like" from a hope into a guarantee.

**Persistence and side effects:** Quest upserts, quest deletes, Progress XP increments, XpEvent inserts.

**Tests that cover it:** Only indirectly. `questsForDay` and the XP/level rules in [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) are unit-tested in [`tests/unit/gamification.test.ts`](../../../tests/unit/gamification.test.ts); the rollover and advance logic in `src/server/quests.ts` has no direct test.

**What seniors notice:**
- Step 5 is a real design decision hiding in a ternary. Absolute-set for the XP quest is self-healing; increment-by-one for activity quests is not. Ask what happens to an activity quest if the same award is retried.
- "Today" is `dayKey(now)` in the server's local timezone. Every day-bucketed feature in the app inherits whatever that function decides.

**Drill:** Call `ensureTodaysQuests` twice in a row, then `advanceQuests` twice for the same single lesson completion. Write down what each of the six steps above does on the second call. Which ones are idempotent, which are not, and which one is only idempotent because of a database constraint rather than the code?

**Self-grade:**
- Basic: finds where quests get created.
- Solid: explains why upsert-on-a-unique-key makes the repeated call safe.
- Strong: distinguishes the self-healing XP quest from the increment-only activity quests, and names the retry scenario that breaks the second one.
