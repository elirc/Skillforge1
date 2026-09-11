# 03 Domain Glossary

| Term | Meaning | Where it appears | Confusions to avoid |
| --- | --- | --- | --- |
| Course | Top-level learning product with language, tags, difficulty, modules | [`prisma/schema.prisma:40-55`](../../../prisma/schema.prisma#L40-L55), [`content/javascript-foundations/course.json`](../../../content/javascript-foundations/course.json) | Course is not progress; completion is per lesson. |
| Module | Ordered group inside a course | [`prisma/schema.prisma:57-68`](../../../prisma/schema.prisma#L57-L68) | Not an ES module. |
| Lesson | User-facing learning step with content blocks and knowledge items | [`prisma/schema.prisma:70-83`](../../../prisma/schema.prisma#L70-L83), [`src/app/courses/[slug]/lessons/[lessonId]/page.tsx`](../../../src/app/courses/%5Bslug%5D/lessons/%5BlessonId%5D/page.tsx) | Lesson content is JSON, not MDX. |
| ContentBlock | Prose, code example, or callout rendered in a lesson | [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts), [`src/features/lessons/lesson-player.tsx`](../../../src/features/lessons/lesson-player.tsx) | Not reviewable by itself. |
| KnowledgeItem | Atomic reviewable concept: MCQ, cloze, or code | [`prisma/schema.prisma:85-99`](../../../prisma/schema.prisma#L85-L99), [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts) | This is the unit of spaced repetition, not the lesson. |
| ReviewState | Per-learner scheduling state for one KnowledgeItem | [`prisma/schema.prisma:101-120`](../../../prisma/schema.prisma#L101-L120), [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37) | It is the scheduler's memory; never trust a client-supplied due date. |
| Attempt | Audit record of a review response | [`prisma/schema.prisma:122-136`](../../../prisma/schema.prisma#L122-L136), [`src/server/review.ts:79-88`](../../../src/server/review.ts#L79-L88) | Not the source of due dates. |
| RecallScore | User-facing grading: again, hard, good, easy | [`src/lib/enums.ts:14`](../../../src/lib/enums.ts#L14), [`src/server/review.ts:7-15`](../../../src/server/review.ts#L7-L15) | Correctness and recall score are related but separate. Stored uppercased on `Attempt.recallScore`. |
| Stability | Scheduler estimate of memory durability | [`src/lib/srs/scheduler.ts`](../../../src/lib/srs/scheduler.ts) | Current implementation is FSRS-like fallback, not a full audited FSRS implementation. |
| Progress | XP, level, streaks, streak freezes, and daily XP goal | [`prisma/schema.prisma:138-151`](../../../prisma/schema.prisma#L138-L151), [`src/lib/gamification.ts:5-13`](../../../src/lib/gamification.ts#L5-L13) | Course progress in the UI is derived from LessonCompletion, not from this row. |
| XpEvent | Append-only XP ledger row, bucketed by local `YYYY-MM-DD` day | [`prisma/schema.prisma:155-167`](../../../prisma/schema.prisma#L155-L167), [`src/server/gamification.ts:124-130`](../../../src/server/gamification.ts#L124-L130) | The ledger, not `Progress.xp`, is what the daily ring, heatmap, and XP quests read. |
| Quest | One daily objective row per learner per local day | [`prisma/schema.prisma:169-186`](../../../prisma/schema.prisma#L169-L186), [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56) | Quests are generated from goal/experience each day, not authored in content. |
| Achievement | Badge definition | [`prisma/schema.prisma:200-211`](../../../prisma/schema.prisma#L200-L211), [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) | Unlock rules are code-driven predicates; the DB row only stores presentation and XP reward. |
| Problem | Standalone practice problem, outside any course | [`prisma/schema.prisma:226-245`](../../../prisma/schema.prisma#L226-L245), [`src/server/problems.ts`](../../../src/server/problems.ts) | A Problem is not a KnowledgeItem; it has no ReviewState and is not spaced-repeated. |
| Local Learner | The single user row, id `"local"` | [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40) | There is no sign-in and no second user. `getCurrentUser()` upserts, so it never returns null. |
| Goal / Experience | Onboarding answers that bias the feed and daily quests | [`src/lib/enums.ts:23-39`](../../../src/lib/enums.ts#L23-L39), [`src/server/feed.ts:11-20`](../../../src/server/feed.ts#L11-L20) | These personalize ordering only. They never hide content — nothing in this build is locked. |

## Drill

Draw arrows between Course, Module, Lesson, KnowledgeItem, ReviewState, Attempt, Progress, XpEvent, Quest, and Achievement. Mark which relations are one-to-many and which are unique per learner per day.
