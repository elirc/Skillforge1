# 06 Observability And Operations

## Current State

There is no logging, metrics, tracing, health check, alerting, or deployment config. There is also no server to deploy to, no container, and no scheduler — the app runs on the learner's machine against a SQLite file at `data/skillforge.db`. "Operations" here means: the seed worked, the database file exists, and the checks in CI are green.

That is a legitimate end state for this build, not a gap waiting to be filled. What is worth keeping is the question, because the answer changes shape rather than disappearing: when something goes wrong locally, what tells you?

Anchors:
- CI checks: [`.github/workflows/ci.yml:22-28`](../../../.github/workflows/ci.yml#L22-L28)
- Local setup path: `npm run db:setup` (generate, `prisma db push`, seed) — see [`prisma/seed.ts:143-154`](../../../prisma/seed.ts#L143-L154), which prints the seeded course, lesson, and problem counts
- Prisma client singleton: [`src/lib/prisma.ts`](../../../src/lib/prisma.ts)
- Content validation: [`scripts/validate-content.ts`](../../../scripts/validate-content.ts)

## How Would I Know This Broke?

| Flow | Failure signal today | Better signal |
| --- | --- | --- |
| Lesson completion | Learner notices no reviews or no XP | Structured log with lessonId, seeded ReviewState count, and which award branch was taken |
| Review grading | Learner notices repeated cards | Log the `dueAt` transition and the recall score that caused it |
| XP award | The daily ring and the profile total disagree | One log line per `XpEvent` write, since the ledger is meant to be the source of truth |
| Daily quests | The board looks wrong after midnight | Log the `dayKey` the roll used; almost every quest bug is a local-day bug |
| Sandbox | UI error message | Counter for timeouts versus thrown errors, so a hanging exercise is distinguishable from a wrong answer |
| Content validation | CI failure, or `npm run validate:content` locally | Per-course validation summary naming the failing item |
| Seed | Silent under-seed; the catalog is just short | The count line at the end of `main()` already does this — read it rather than ignoring it |
| Database file | Prisma throws on first query | An explicit startup check that `data/skillforge.db` exists and has been pushed |

## Operational Additions

Sized for a local single-user app, in the order they would actually pay:

- Structured logging around the three server modules that write progress: `actions.ts`, `gamification.ts`, `review.ts`.
- Log the branch, not just the call: "repeat, no award" is the most useful line this app could emit.
- Error boundaries for the major UI routes so a render failure does not blank the dashboard.
- Surface the seed summary somewhere visible, since a stale or partial seed is the most common silent failure.
- Skip the health route, the metrics dashboard, and the alerting. There is no on-call; adding them would be cargo cult.

## Drill

Design one log event for `gradeReviewItem`. Include the event name, fields, which fields to exclude, and how it would help you debug "this card keeps coming back" without a debugger. Then justify whether it should also log on the success path, given that nobody is reading logs on a machine with one user.
