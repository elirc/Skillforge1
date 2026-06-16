# 02 Data Model And Persistence

## Schema Overview

| Cluster | Models | Anchors | Purpose |
| --- | --- | --- | --- |
| Content | Course, Module, Lesson, KnowledgeItem | [`prisma/schema.prisma:41-99`](../../../prisma/schema.prisma#L41-L99) | Versioned learning content in DB |
| Identity | User, Account, Session, VerificationToken | [`prisma/schema.prisma:101-122`](../../../prisma/schema.prisma#L101-L122), [`prisma/schema.prisma:249-287`](../../../prisma/schema.prisma#L249-L287) | Auth.js persistence |
| Review | ReviewState, Attempt | [`prisma/schema.prisma:124-159`](../../../prisma/schema.prisma#L124-L159) | Spaced repetition and audit trail |
| Progress | Progress, LessonCompletion | [`prisma/schema.prisma:161-186`](../../../prisma/schema.prisma#L161-L186) | XP/streak and lesson completion |
| Social/business | Achievement, League, LeaderboardEntry, Organization | [`prisma/schema.prisma:188-247`](../../../prisma/schema.prisma#L188-L247) | Badges, rankings, future org tier |

## Important Invariants

- One ReviewState per user and KnowledgeItem: [`prisma/schema.prisma:141`](../../../prisma/schema.prisma#L141).
- Efficient due queue lookup by user/due date: [`prisma/schema.prisma:142`](../../../prisma/schema.prisma#L142).
- One LessonCompletion per user and Lesson: [`prisma/schema.prisma:185`](../../../prisma/schema.prisma#L185).
- One Progress row per user: [`prisma/schema.prisma:163`](../../../prisma/schema.prisma#L163).
- One leaderboard entry per league/user: [`prisma/schema.prisma:234`](../../../prisma/schema.prisma#L234).

## Seed Data

Seed imports course JSON after Zod validation in [`prisma/seed.ts:10-12`](../../../prisma/seed.ts#L10-L12), upserts courses in [`prisma/seed.ts:15-39`](../../../prisma/seed.ts#L15-L39), recreates modules/lessons/items in [`prisma/seed.ts:41-73`](../../../prisma/seed.ts#L41-L73), and seeds demo due reviews in [`prisma/seed.ts:143-170`](../../../prisma/seed.ts#L143-L170).

## Transaction Boundaries

Current multi-write flows:
- Lesson completion writes completion, review states, progress, leaderboard, achievements across [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24) and [`src/server/gamification.ts:4-69`](../../../src/server/gamification.ts#L4-L69).
- Review grading updates ReviewState, creates Attempt, awards XP in [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90).

Possible risk: these are not wrapped in `prisma.$transaction`. A failure between writes can leave partially updated state. Treat this as a production-hardening candidate, not a confirmed user-visible bug.

## How To Safely Change Schema

1. Update [`prisma/schema.prisma`](../../../prisma/schema.prisma).
2. Generate migration with `npm run db:migrate` against local Postgres.
3. Update seed data if required.
4. Update Zod contracts when JSON/domain shape changes.
5. Add or update tests.
6. Think rollback: can old code read new data, and can new code handle old data?

## Drill

Design a schema change for daily XP goal history. Decide whether it belongs on `Progress` or a new table. Strong answers mention query patterns, retention, migration, and UI needs.
