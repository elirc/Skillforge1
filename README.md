# Skillforge

A local-only, single-learner coding trainer: short lessons, runnable exercises, spaced repetition, and boot.dev-style gamification (XP, levels, streaks, daily quests, achievements) aimed at building CRUD web apps with C#, .NET, and SQL.

Everything lives on your machine. There is no sign-in, no account, no server to deploy, and no data leaves the box — progress is a SQLite file at `data/skillforge.db`.

## Quick Start

```bash
pnpm install          # or: npm install
cp .env.example .env  # DATABASE_URL points at data/skillforge.db
npm run db:setup      # generate client, create the SQLite file, seed content
npm run dev
```

Open `http://localhost:3000`. The first visit creates your learner row; `/onboarding` sets your goal, experience, and daily XP target.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start Next.js. |
| `npm run db:setup` | Generate the Prisma client, create/update the SQLite file, seed content. |
| `npm run db:seed` | Re-seed courses, problems, and achievements from `content/`. |
| `npm run db:reset` | Recreate the database from scratch (**erases your progress**). |
| `npm run db:studio` | Browse the local database in Prisma Studio. |
| `npm run lint` / `npm run typecheck` | ESLint / strict TypeScript. |
| `npm test` | Vitest unit tests (gamification, SRS, sandbox). |
| `npm run test:e2e` | Playwright happy path. Runs against the dev server with a seeded database; not part of CI. |
| `npm run validate:content` | Assemble course JSON and execute every reference solution. |

Your progress survives `db:seed`: content rows are upserted against stable position keys (course + module + lesson order), so their ids -- and the completions and review states pointing at them -- persist across re-seeds. Deleting or reordering a lesson still drops the review history for that slot. Only `db:reset` (or the **Reset progress** button on `/profile`) clears everything.

## How it works

**Personalization.** `/onboarding` records a goal (`crud-dev`, `interview`, `fundamentals`), an experience level, a daily XP goal, and optional focus tags on the single `User` row. `src/server/feed.ts` turns those into a ranked *Next up* list on the dashboard: due reviews first, then a practice problem chosen to hit your weakest concept tags, then the next unfinished lesson in the language your goal prioritizes. (A problem only outranks the lesson when it actually targets a weak concept; otherwise the lesson comes first.)

**Weakness detection.** Every graded review updates a `ReviewState` (`src/lib/srs/scheduler.ts`). `getWeakConcepts` averages `conceptStrength` per concept tag, which drives both the "Shakiest concepts" panel and problem recommendations. Nothing is hand-configured — it comes from your own recall data.

**Gamification.** `src/lib/gamification.ts` is the pure engine (unit-tested, no DB):

- **XP** per activity, multiplied by a streak bonus that caps at 1.5x.
- **Levels** on a quadratic curve (`75 * (n-1)^2`), each with a rank name.
- **Streaks** that extend on consecutive local days; a freeze covers exactly one missed day, longer gaps reset. You get two freezes and they are never replenished.
- **Daily quests** generated from your goal and experience, rolled fresh each local day.
- **Achievements** as declarative definitions with an `earned` predicate and a progress bar.

`src/server/gamification.ts` is the single write path: it applies XP and streak, appends to the `XpEvent` ledger, advances quests, unlocks achievements, pays out both bonuses, and returns an `AwardSummary`. Every server action returns that summary, and the client fans it out into toasts via `src/store/reward-store.ts`.

## Architecture

- `prisma/schema.prisma` — SQLite. Because SQLite has no enums or scalar lists, those columns are strings/JSON parsed through `src/lib/enums.ts`.
- `content/<course>/` — versioned course content, the source of truth (see below). Seeded into SQLite; never authored in the database.
- `src/lib/sandbox/` — runs learner JavaScript in a worker with a hard timeout and network escape APIs disabled.
- `src/server/` — `user.ts` (the local profile), `feed.ts` (what to do next), `gamification.ts` (XP/quests/achievements), `quests.ts`, `review.ts`, `problems.ts`, `actions.ts`.
- `src/features/` — catalog, lessons, review, problems, dashboard, onboarding, profile.

## Authoring Content

Each course is a directory tree under `content/`:

```
content/
  _authoring/types.ts            # shared TestCase type for exercises (build-time only)
  javascript-foundations/
    course.json                  # slug, title, description, language, topicTags, difficulty, order, outcomes
    01-values-and-decisions/
      module.json                # { "title": "Values and Decisions" }
      01-variables-hold-values/
        lesson.json              # prose/code/callout blocks + MCQ/CLOZE/CODE items
        add-xp.starter.ts        # the incomplete stub the learner sees
        add-xp.solution.ts       # the reference solution (must pass the tests)
        add-xp.tests.ts          # exports `functionName` and a typed `tests` array
```

- **Order** for modules and lessons comes from the numeric directory prefix; titles live in `module.json` / `lesson.json`.
- **MCQ and CLOZE** items are authored inline in `lesson.json`.
- **CODE** items reference an exercise by file prefix: `{ "type": "CODE", "prompt": "...", "exercise": "add-xp", "conceptTags": [...] }`. Authoring exercises as real TypeScript means they are linted, type-checked, and runnable.
- Exercise functions must be self-contained (no value imports); only `import type` from `@content/_authoring/types`.

### Standalone practice problems

`content/problems/<slug>/` holds a `problem.json` plus the same `<exercise>.{starter,solution,tests}.ts` trio:

```json
{
  "slug": "pair-sum",
  "title": "Pair Sums to Target",
  "prompt": "Return true if any two values add up to the target.",
  "language": "javascript",
  "difficulty": "EASY | MEDIUM | HARD",
  "conceptTags": ["arrays", "search"],
  "order": 2,
  "exercise": "pair-sum",
  "explanation": {
    "beginner": "Plain-language walkthrough of the rule.",
    "junior": "What good code for this looks like and which edge cases matter."
  }
}
```

`explanation` is required (both `beginner` and `junior` keys); `language` and `order` have defaults.

Run `npm run validate:content` to assemble every course and problem and execute each reference solution against its tests.

## Not built yet

- **C# and SQL execution.** The sandbox runs JavaScript/TypeScript only. Real C# grading (a prewarmed `dotnet` scratch project behind a local API route) and real SQL grading (in-browser SQLite with result-set comparison) are the next step; the C# content currently ships as reading plus MCQ/CLOZE items.
- **The C#/.NET/SQL CRUD curriculum** as executable lessons. `content/csharp-dotnet-interview-prep/` is prose and quizzes today.
