# 03 Domain Glossary

| Term | Meaning | Where it appears | Confusions to avoid |
| --- | --- | --- | --- |
| Course | Top-level learning product with language, tags, difficulty, modules | [`prisma/schema.prisma:41-57`](../../../prisma/schema.prisma#L41-L57), [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json) | Course is not progress; completion is per lesson. |
| Module | Ordered group inside a course | [`prisma/schema.prisma:59-70`](../../../prisma/schema.prisma#L59-L70) | Not an ES module. |
| Lesson | User-facing learning step with content blocks and knowledge items | [`prisma/schema.prisma:72-85`](../../../prisma/schema.prisma#L72-L85), [`src/app/courses/[slug]/lessons/[lessonId]/page.tsx:18-25`](../../../src/app/courses/%5Bslug%5D/lessons/%5BlessonId%5D/page.tsx#L18-L25) | Lesson content is JSON, not MDX. |
| ContentBlock | Prose, code example, or callout rendered in a lesson | [`src/lib/content-schema.ts:3-18`](../../../src/lib/content-schema.ts#L3-L18), [`src/features/lessons/lesson-player.tsx:69-81`](../../../src/features/lessons/lesson-player.tsx#L69-L81) | Not reviewable by itself. |
| KnowledgeItem | Atomic reviewable concept: MCQ, cloze, or code | [`prisma/schema.prisma:87-99`](../../../prisma/schema.prisma#L87-L99), [`src/lib/content-schema.ts:45-64`](../../../src/lib/content-schema.ts#L45-L64) | This is the unit of spaced repetition, not the lesson. |
| ReviewState | Per-user scheduling state for one KnowledgeItem | [`prisma/schema.prisma:124-143`](../../../prisma/schema.prisma#L124-L143), [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37) | It is user-specific; never trust client due dates. |
| Attempt | Audit record of a review response | [`prisma/schema.prisma:145-159`](../../../prisma/schema.prisma#L145-L159), [`src/server/review.ts:79-88`](../../../src/server/review.ts#L79-L88) | Not the source of due dates. |
| RecallScore | User-facing grading: again, hard, good, easy | [`prisma/schema.prisma:27-32`](../../../prisma/schema.prisma#L27-L32), [`src/server/review.ts:7-15`](../../../src/server/review.ts#L7-L15) | Correctness and recall score are related but separate. |
| Stability | Scheduler estimate of memory durability | [`src/lib/srs/scheduler.ts:4-12`](../../../src/lib/srs/scheduler.ts#L4-L12) | Current implementation is FSRS-like fallback, not a full audited FSRS implementation. |
| Progress | XP, level, streaks, and daily goal | [`prisma/schema.prisma:161-174`](../../../prisma/schema.prisma#L161-L174), [`src/lib/gamification.ts:3-10`](../../../src/lib/gamification.ts#L3-L10) | Course progress in UI is derived from LessonCompletion. |
| Achievement | Badge definition | [`prisma/schema.prisma:188-198`](../../../prisma/schema.prisma#L188-L198), [`prisma/seed.ts:76-115`](../../../prisma/seed.ts#L76-L115) | Unlock rules are code-driven, not stored in DB. |
| League | Weekly leaderboard bucket | [`prisma/schema.prisma:213-236`](../../../prisma/schema.prisma#L213-L236), [`src/server/gamification.ts:29-48`](../../../src/server/gamification.ts#L29-L48) | Current league id is hard-coded. |
| Organization | Future team-plan entity | [`prisma/schema.prisma:238-247`](../../../prisma/schema.prisma#L238-L247), [`src/app/admin/org/page.tsx`](../../../src/app/admin/org/page.tsx) | UI is a stub, not full org authorization. |
| Guest Learner | Local/demo fallback user when no Auth.js session exists | [`src/server/user.ts:4-22`](../../../src/server/user.ts#L4-L22) | Production should not share anonymous state across users. |

## Drill

Draw arrows between Course, Module, Lesson, KnowledgeItem, ReviewState, Attempt, Progress, and Achievement. Mark which relations are one-to-many and which are unique per user.
