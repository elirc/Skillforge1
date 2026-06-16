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
- `content/courses/*.json` stores versioned course content validated by `src/lib/content-schema.ts`.
- `src/lib/srs/scheduler.ts` exposes `scheduleReview(state, recallScore, now)` so FSRS/SM-2 style scheduling can be swapped without touching UI.
- `src/server/actions.ts` keeps lesson completion, review grading, XP, streaks, and ReviewState updates server-side.
- `src/lib/sandbox` executes user JavaScript in a worker harness with a hard timeout and disabled network escape APIs.
- `src/features/*` groups catalog, lessons, reviews, gamification-facing UI, and auth-adjacent behavior.

## Auth, Guest Mode, And Payments

Auth.js is configured for GitHub OAuth and email magic links. If provider keys are absent, the app still runs with a seeded guest/demo learner so local evaluation and E2E can proceed. Guest progress migration is documented as the next production hardening step: local guest progress should be serialized client-side and replayed through a server action after sign-in.

Stripe is included behind `NEXT_PUBLIC_STRIPE_ENABLED` and empty-key safe defaults. Pro catalog gates render, but checkout is intentionally stubbed until keys and products exist.

## Open Questions

- Which email provider should own production magic-link delivery?
- Should organizations use invite-only seats or domain-based auto-join?
- When Python launches, should Pyodide run in the same worker protocol or a language-specific runner package?
