# Skillforge

A local-only, single-learner coding trainer: short lessons, runnable exercises, spaced repetition, and boot.dev-style gamification (XP, levels, streaks, daily quests, achievements) aimed at building CRUD web apps with C#, .NET, and SQL.

Learning progress stays in a local SQLite file at `data/skillforge.db`. Skillforge runs on loopback for one learner. The optional Inventory Desk companion has separate local accounts and a separate database.

## Quick Start

```bash
pnpm install          # or: npm install
cp .env.example .env  # DATABASE_URL points at data/skillforge.db
npm run db:setup      # generate client, create the SQLite file, seed content
npm run csharp:build  # builds the C# exercise runner (requires .NET 10)
npx playwright install chromium # mounted React grading / browser checks
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
| `npm test` | Vitest unit tests (gamification, SRS, sandbox, C# runner). |
| `npm run csharp:build` | Build the .NET process that compiles and runs C# exercises. |
| `npm run test:e2e` | Create a temporary database copy, sync it, and run browser journeys on isolated port 3107. |
| `npm run test:db` | Run completion, review, reward, content-update, and backup regressions in helper-owned databases. |
| `npm run db:backup` / `npm run db:migrate` | Consistent SQLite backup / additive identity migration for an existing installation. |
| `npm run runtime:prepare` | Build local SQL/React runtime assets and the companion source download. Also runs before dev/build. |
| `npm run validate:content` | Assemble course JSON and execute every reference solution. |
| `npx tsx scripts/check-content.ts --course <slug> --problem-prefix <p>` | Low-memory scoped check while authoring: runs selected exercises one at a time, confirms solutions pass and starters fail, and lints MCQ/CLOZE shape. |
| `node scripts/test-completion-local.mjs` | Run the completion and review-grading tests against a throwaway SQLite file. |
| `node scripts/test-backup-local.mjs` | Run the progress export/import round-trip tests against a throwaway SQLite file. |

Content synchronization uses immutable authored IDs. Reordering keeps lesson and review identities; removed content is archived with its learner history. Existing populated databases are backed up before CLI seeding. Only `db:reset` or Reset progress deliberately clears learner progress.

For an existing installation, stop its dev server, run `npm run db:backup`, `npm run db:migrate`, `npm run db:generate`, then `npm run db:seed`. The migration adds columns without recreating learner tables. Later content updates can be previewed and applied from Profile, with an automatic database backup. Do not use a destructive schema reset to install content.

## How it works

**Personalization.** `/onboarding` records a goal (`crud-dev`, `interview`, `fundamentals`), an experience level, a daily XP goal, and optional focus tags on the single `User` row. `src/server/feed.ts` turns those into a ranked *Next up* list on the dashboard: due reviews first, then a practice problem chosen to hit your weakest concept tags, then the next unfinished lesson in the language your goal prioritizes. (A problem only outranks the lesson when it actually targets a weak concept; otherwise the lesson comes first.)

**Weakness detection.** Every graded review updates a `ReviewState` (`src/lib/srs/scheduler.ts`). `getWeakConcepts` averages `conceptStrength` per concept tag, which drives both the "Shakiest concepts" panel and problem recommendations. Nothing is hand-configured — it comes from your own recall data.

**Grading.** Review answers are graded on the server (`src/lib/grading.ts`) from the stored card, never from a value the browser sends. Grading a card, recording the attempt, and awarding XP happen in one transaction, as does lesson completion (`src/server/completion.ts`).

**Mastery.** `/mastery` lists every concept tag you have review data for, grouped by course, with a strength band, due count, and tags from finished lessons you have not reviewed yet. Each tag links to `/reviews?tag=<tag>`, which drills only the due cards carrying that concept.

**Backup.** `/profile` can download your progress as JSON and import it back. New exports include the catalog version and immutable lesson/item IDs. The first sync preserves positional aliases for this installation’s legacy exports. Editor drafts have their own browser storage and per-exercise export; they are not part of progress JSON. Import *replaces* current progress in a single transaction and reports anything it had to skip.

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

- **Identity** is the immutable `id` in every module, lesson, and knowledge item. Run `npm run content:ids` only to fill missing IDs; preserve existing IDs when renaming or moving content. Removed rows are archived, never repurposed for a different concept.
- **Order** comes from numeric directory prefixes; it is presentation, not identity. Course metadata includes version and prerequisite slugs. Lessons include estimated minutes.
- **Teaching** should include an objective, worked example and trace, plausible mistake, modification task, independent exercise, hints, and solution walkthrough.
- **Quality**: `node scripts/check-content-quality.mjs` checks identities and MCQ choices/position bias. The optional `--balance-choices` flag distributes authored answers; the UI also shuffles choices.
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

## C# exercises

C# exercises are compiled and executed by a small .NET process in
`tools/csharp-runner/`, built with `npm run csharp:build` and driven over
stdin/stdout. It stays warm because Roslyn's first compilation costs about
twenty seconds of JIT; after that a run takes roughly half a second. The
browser cannot run C#, so lesson pages post to `/api/sandbox/csharp` instead
of using the worker; JavaScript exercises are unaffected.

Without the .NET SDK the app still runs — C# exercises simply report that the
runner is not built, and `validate:content` fails unless you set
`SKILLFORGE_SKIP_CSHARP=1`.

### Authoring

A C# exercise is a `<key>.starter.cs` / `<key>.solution.cs` pair beside
`lesson.json`, plus the same `<key>.tests.ts` used by JavaScript exercises —
the cases are plain JSON either way, and keeping them in TypeScript keeps them
type-checked. The loader picks the language from the file extension.

The rules the harness imposes:

- Define **exactly one** `public static` method named in `functionName`. Untyped
  JSON arguments cannot choose between overloads, and `ref`/`out` are rejected.
- Arguments are deserialized into the declared parameter types, so a record
  argument is a JSON object keyed by its **C# property names** (`{"ConceptTag": …}`),
  and `DateTime` is an ISO-8601 string.
- Return values are compared structurally: object key order does not matter,
  and `8` matches `8.0`. Return ordered collections — a `HashSet` enumerates
  unpredictably.
- `async Task<T>` is awaited and the unwrapped value compared, so async
  exercises work.
- `Console.WriteLine` is captured and shown to the learner rather than printed.
- `System`, `System.Collections.Generic`, `System.Linq`, `System.Threading` and
  `System.Threading.Tasks` are already imported. Only the BCL is available.

`validate:content` compiles every starter (it must build before a learner sees
it) and compiles and runs every solution.

A problem's `language` in `problem.json` is only its catalog label. Which
sandbox grades it is decided by the exercise files and stored separately as
`runtime` — that is why the C#-themed problems in the problem bank, which are
authored and answered in TypeScript, still run in the browser.

### A note on trust

`/api/sandbox/csharp` compiles and executes arbitrary C# as the user running the
app, with no sandbox boundary beyond a two-second execution budget. That is the
same trust level as the rest of this repo — you already run its code — but it is
worth stating plainly. The endpoint refuses non-local requests so a web page you
happen to be visiting cannot post to it. Do not expose this app on a network.

## Browser and database checks

Run `npm run test:e2e`. The helper makes a consistent temporary copy, applies the additive migration and sync, starts its own loopback server on port 3107, and removes only its own temporary directory afterward. Tests refuse a non-helper database. Unit, isolated database, content, browser, companion, and build checks are included in CI. Install Chromium first with `npx playwright install chromium`.

To check the production server after `npm run build`, set `SKILLFORGE_E2E_PRODUCTION=1` when running the browser helper. The same temporary-database isolation applies.

## Learning paths and projects

The authored catalog contains 15 courses, 287 lessons, and 449 standalone problems. New tracks cover C# foundations, executable SQL business labs, regression testing/debugging, mounted React components, an ASP.NET API, shipping/maintenance, and a twelve-checkpoint Inventory Desk capstone. The original courses remain available, with additional examples in every JavaScript Foundations lesson.

Today offers a time-based session using prerequisites, focus tags, experience, and your daily minutes. Tracks have resume links and completion states. Problems provide URL filters, solved status, pagination, and separate extra drills. Editors save versioned drafts, expose recovery/export, show diagnostics/test differences and console output, and record help as assisted practice. Mastery separates recall estimates from independent code and delayed-retention evidence.

Visit `/projects` for the Inventory Desk source download, or read [its README](projects/inventory-desk/README.md). It includes the ASP.NET/EF Core API, React UI, console inventory/CSV mini-projects, tests, containers, backup tools, and review checkpoints. `/playground/http` sends real HTTP requests to nonpersistent local fixtures. Project quizzes do not execute or certify your companion project; run its acceptance tests yourself.

## Runtime boundaries

- JavaScript functions are awaited in a worker with a timeout and bounded console output.
- TypeScript keeps typed source and runs a strict semantic compiler before runtime tests. Compile-only labs append type assertions and execute no JavaScript.
- SQL business labs execute SQLite in a fresh in-memory database for each fixture. The older SQL Foundations array models are labelled with their actual JavaScript runtime.
- React integration labs mount real components in an isolated iframe and test DOM interactions. Server grading runs the same harness in headless Chromium. These focused labs are separate from the complete companion UI.
- C# exercise methods remain BCL-only. Real ASP.NET Core and EF Core work lives in the downloadable companion.
- Python Thinking is explicitly an optional reading/recall track with no Python execution.

## Source-based improvement course

[Start the course](astraupskill/README.md). It complements the existing project and learning documentation with a focused trace, regression, and practice sequence.
