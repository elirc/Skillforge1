# 02 Data Model And Persistence

## Schema Overview

The datasource is SQLite ([`prisma/schema.prisma:10-13`](../../../prisma/schema.prisma#L10-L13)), one file at `data/skillforge.db`.

| Cluster | Models | Anchors | Purpose |
| --- | --- | --- | --- |
| Content | Course, Module, Lesson, KnowledgeItem | [`prisma/schema.prisma:40-104`](../../../prisma/schema.prisma#L40-L104) | Learning content, seeded from `content/` |
| Identity | User | [`prisma/schema.prisma:16-38`](../../../prisma/schema.prisma#L16-L38) | The single local learner plus onboarding preferences |
| Review | ReviewState, Attempt | [`prisma/schema.prisma:106-141`](../../../prisma/schema.prisma#L106-L141) | Spaced repetition and audit trail |
| Progress | Progress, LessonCompletion | [`prisma/schema.prisma:143-158`](../../../prisma/schema.prisma#L143-L158), [`prisma/schema.prisma:193-203`](../../../prisma/schema.prisma#L193-L203) | XP/streak/level and lesson completion |
| Activity ledger | XpEvent, Quest | [`prisma/schema.prisma:160-191`](../../../prisma/schema.prisma#L160-L191) | Append-only XP history and the daily quest board |
| Recognition | Achievement, UserAchievement | [`prisma/schema.prisma:205-229`](../../../prisma/schema.prisma#L205-L229) | Badge definitions and unlocks |
| Practice | Problem, ProblemSubmission | [`prisma/schema.prisma:231-266`](../../../prisma/schema.prisma#L231-L266) | Standalone problems outside any course |

Notice what the `User` model does **not** have: no password, no `Account`/`Session` tables, no role, no plan, no organization. `email` is nullable and unused. The absence is the design.

## Important Invariants

- One ReviewState per learner and KnowledgeItem: [`prisma/schema.prisma:123`](../../../prisma/schema.prisma#L123).
- Efficient due-queue lookup by learner/due date: [`prisma/schema.prisma:124`](../../../prisma/schema.prisma#L124).
- One LessonCompletion per learner and Lesson: [`prisma/schema.prisma:202`](../../../prisma/schema.prisma#L202).
- One Progress row per learner: [`prisma/schema.prisma:145`](../../../prisma/schema.prisma#L145).
- One Quest per learner, local day, and quest key: [`prisma/schema.prisma:189`](../../../prisma/schema.prisma#L189).
- One UserAchievement per learner and achievement: [`prisma/schema.prisma:228`](../../../prisma/schema.prisma#L228).

## What SQLite Cannot Express Here

No enum types and no scalar lists. So:
- `Course.difficulty`, `KnowledgeItem.type`, `ReviewState.state`, `Attempt.recallScore`, `Problem.difficulty` are `String`, with valid values written only in trailing comments.
- `topicTags`, `outcomes`, `conceptTags`, `focusTags` are JSON-encoded `String` columns defaulting to `"[]"`.
- The real type system for these columns is [`src/lib/enums.ts`](../../../src/lib/enums.ts). A query that skips it gets an unvalidated `string` with no compiler complaint.

`XpEvent.day` and `Quest.day` are also strings — `YYYY-MM-DD` in the learner's local timezone, produced by `dayKey`. Storing a date as text is a real trade: it makes "today" cheap and timezone-stable for one user, and makes range queries lexicographic rather than temporal.

## Seed Data

Seed assembles courses from the content tree and upserts each one in [`prisma/seed.ts:11-92`](../../../prisma/seed.ts#L11-L92), upserts standalone problems in [`prisma/seed.ts:94-115`](../../../prisma/seed.ts#L94-L115) and achievements in [`prisma/seed.ts:117-133`](../../../prisma/seed.ts#L117-L133), and ensures the local learner row in [`prisma/seed.ts:135-141`](../../../prisma/seed.ts#L135-L141) — with `update: {}`, so a re-seed never clobbers real progress. It seeds no fake progress and no demo reviews — your review queue comes only from lessons you actually complete.

## Transaction Boundaries

Current multi-write flows:
- Lesson completion writes completion, review states, progress, XP events, quests, achievements across [`src/server/actions.ts:27-39`](../../../src/server/actions.ts#L27-L39) and [`src/server/gamification.ts:60-122`](../../../src/server/gamification.ts#L60-L122).
- Review grading updates ReviewState, creates Attempt, awards XP in [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91).

These are not wrapped in `prisma.$transaction`. A failure between writes can leave partially updated state — for example a `ReviewState` advanced with no matching `Attempt` row, or quest progress with no XP event behind it. Compare with [`resetProgressAction`](../../../src/server/actions.ts#L87-L104), which does use `prisma.$transaction` for its eight deletes. The codebase knows the tool; the hot paths just do not use it.

## How To Safely Change Schema

1. Update [`prisma/schema.prisma`](../../../prisma/schema.prisma).
2. Apply it with `npm run db:push`. There is no migration history and no `db:migrate` script — `prisma db push` diffs the schema against the file and rewrites it in place.
3. Regenerate the client (`npm run db:generate`), or just run `npm run db:setup`, which does generate + push + seed.
4. Update seed data if required.
5. Update the Zod contracts in [`src/lib/enums.ts`](../../../src/lib/enums.ts) and [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts) when domain shape changes — for a string-typed column, this is the *only* place the change is enforced.
6. Add or update tests.
7. Understand what `db push` costs you: a destructive change asks for `--force-reset`, which drops the learner's real progress. There is no rollback and no history to inspect. That is an acceptable trade for one local user and would not be for anyone else.

## Drill

Design a schema change for daily XP goal history. Decide whether it belongs on `Progress` or a new table — and before you answer, look at `XpEvent`, which already stores per-day XP. Strong answers mention query patterns, retention, what `db push` will do to existing rows, and whether the data can be derived instead of stored.
