# Skillforge

Skillforge is a web-first coding-skills learning platform built with Next.js App Router, TypeScript, Prisma/PostgreSQL, Auth.js, Tailwind, CodeMirror, server-side spaced repetition, and gamification.

## Quick Start

1. Install dependencies:

```bash
corepack enable
corepack pnpm install
```

2. Copy environment defaults:

```bash
cp .env.example .env
```

3. Start Postgres:

```bash
docker compose up -d
```

4. Migrate and seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: start Next.js.
- `npm run lint`: ESLint.
- `npm run typecheck`: strict TypeScript check.
- `npm test`: Vitest unit tests.
- `npm run test:e2e`: Playwright happy path.
- `npm run validate:content`: validate course JSON and execute reference solutions.
- `npm run db:migrate`: Prisma migration.
- `npm run db:seed`: seed courses, achievements, demo learner, due reviews, and org stub.

## Architecture

- `prisma/schema.prisma` models courses, lessons, knowledge items, review states, attempts, progress, achievements, leagues, organizations, and Auth.js tables.
- `content/<course>/` stores versioned course content as a directory tree (see "Authoring content"), compiled and validated by `scripts/lib/content.ts` + `src/lib/content-schema.ts`.
- `src/lib/srs/scheduler.ts` exposes `scheduleReview(state, recallScore, now)` so FSRS/SM-2 style scheduling can be swapped without touching UI.
- `src/server/actions.ts` keeps lesson completion, review grading, XP, streaks, and ReviewState updates server-side.
- `src/lib/sandbox` executes user JavaScript in a worker harness with a hard timeout and disabled network escape APIs.
- `src/features/*` groups catalog, lessons, reviews, gamification-facing UI, and auth-adjacent behavior.

## Authoring Content

Course content is the source of truth in the repo and is seeded into Postgres; you never author directly in the database. Each course is a directory tree under `content/`:

```
content/
  _authoring/types.ts            # shared TestCase type for exercises (build-time only)
  javascript-foundations/
    course.json                  # course metadata (slug, title, language, difficulty, isPro, order, outcomes)
    01-values-and-decisions/
      module.json                # { "title": "Values and Decisions" }
      01-variables-hold-values/
        lesson.json              # prose/code/callout blocks + MCQ/CLOZE/CODE knowledge items
        add-xp.starter.ts        # the incomplete stub the learner sees
        add-xp.solution.ts       # the reference solution (must pass the tests)
        add-xp.tests.ts          # export `functionName` and a typed `tests` array
```

- **Order** for modules and lessons comes from the numeric directory prefix (`01-`, `02-`); titles live in `module.json` / `lesson.json`.
- **MCQ and CLOZE** items are authored inline in `lesson.json`.
- **CODE** items reference an exercise by file prefix: `{ "type": "CODE", "prompt": "...", "exercise": "add-xp", "conceptTags": [...] }`. The loader reads the three `add-xp.*.ts` files, transpiles the starter/solution to plain JS for the sandbox, and reads `functionName`/`tests` from the tests module. Authoring code as real TypeScript means it is linted, type-checked, and runnable — no escaped strings in JSON.
- Exercise functions must be **self-contained** (no value imports); only `import type` from `@content/_authoring/types` is allowed.

### Standalone practice problems

A problem bank lives in `content/problems/<slug>/` and is independent of any lesson (`Problem` / `ProblemSubmission` models in the schema). Each problem is a `problem.json` plus the same `<exercise>.{starter,solution,tests}.ts` trio:

```json
{
  "slug": "pair-sum",
  "title": "Pair Sums to Target",
  "prompt": "Return true if any two values add up to the target.",
  "language": "javascript",
  "difficulty": "EASY | MEDIUM | HARD",
  "conceptTags": ["arrays", "search"],
  "order": 2,
  "exercise": "pair-sum"
}
```

Problems support difficulty ratings, concept-tag filtering, and many problems per concept. Read them with `getProblems(filters)` (`src/features/problems/queries.ts`) and record attempts with `recordProblemSubmissionAction` (`src/server/problems.ts`).

### Validating

Run `npm run validate:content` to assemble every course and problem, type-check the tree (`npm run typecheck`), and execute each reference solution against its tests in the sandbox. CI runs both, so a broken exercise fails the build rather than reaching a learner. To preview content end to end, run `npm run db:migrate && npm run db:seed` and open the app.

## Auth, Guest Mode, And Payments

Auth.js is configured for GitHub OAuth and email magic links. If provider keys are absent, the app still runs with a seeded guest/demo learner so local evaluation and E2E can proceed. Guest progress migration is documented as the next production hardening step: local guest progress should be serialized client-side and replayed through a server action after sign-in.

Stripe is included behind `NEXT_PUBLIC_STRIPE_ENABLED` and empty-key safe defaults. Pro catalog gates render, but checkout is intentionally stubbed until keys and products exist.

## Open Questions

- Which email provider should own production magic-link delivery?
- Should organizations use invite-only seats or domain-based auto-join?
- When Python launches, should Pyodide run in the same worker protocol or a language-specific runner package?
