# 04 Tooling And Build System

## Command Map

| Command | Status | What it proves | Evidence |
| --- | --- | --- | --- |
| `corepack pnpm install` | Verified earlier | Dependencies install from lockfile | [`package.json`](../../../package.json), [`pnpm-lock.yaml`](../../../pnpm-lock.yaml) |
| `npm run lint` | Verified | ESLint passes | [`package.json`](../../../package.json) |
| `npm run typecheck` | Verified | TypeScript strict contracts compile | [`tsconfig.json`](../../../tsconfig.json) |
| `npm test` | Verified | Unit tests pass | [`vitest.config.ts`](../../../vitest.config.ts) |
| `npm run validate:content` | Verified | Course JSON and code reference solutions pass | [`scripts/validate-content.ts`](../../../scripts/validate-content.ts) |
| `npm run build` | Verified earlier | Next production build compiles | [`next.config.ts`](../../../next.config.ts) |
| `npm run db:setup` | Verified | Prisma client generated, SQLite file created from the schema, content seeded | `package.json:19` |
| `npm run db:push` | Verified | Schema applied to the SQLite file without a migration history | `package.json:18` |
| `npm run db:reset` | Available | Recreates the database with `--force-reset`, **erasing learner progress** | `package.json:20` |
| `npm run db:studio` | Available | Opens Prisma Studio against the local file | `package.json:21` |
| `npm run test:e2e` | Needs a seeded DB and a dev server | Browser happy path | [`playwright.config.ts`](../../../playwright.config.ts) |

Note there is no `db:migrate`. This project applies its schema with `prisma db push`, and `prisma/` has no `migrations/` directory.

## CI Mental Model

CI installs, runs `db:setup` against a throwaway SQLite file, lints, typechecks, validates content, runs unit tests, and builds — [`.github/workflows/ci.yml:13-28`](../../../.github/workflows/ci.yml#L13-L28). It does not run Playwright E2E. So CI catches pure logic regressions, schema/seed breakage, and content breakage, but not browser integration.

The DB step is cheap here for a structural reason worth internalizing: because storage is a file, "provision a database" is `mkdir -p data`. A large part of what makes CI slow and flaky elsewhere is not the tests, it is the services.

## Build Pitfalls

- Prisma requires `DATABASE_URL` even for validation in many CLI paths. In this repo it is a relative file path resolved from `prisma/`, which is why it reads `file:../data/skillforge.db`.
- Next build can fail if routes try to prerender DB reads; dynamic routes are marked with `dynamic = "force-dynamic"` in files like [`src/app/page.tsx:15`](../../../src/app/page.tsx#L15).
- pnpm is the lockfile source of truth. npm scripts are still used as a command interface.

## Drill

Add an E2E job to CI. Write out the steps and the reasoning:
1. Which existing steps in `ci.yml` can be reused as-is?
2. Where does the seeded database come from, and does the job need a fresh one per run?
3. Install Playwright browsers.
4. Start the dev server, or let Playwright's `webServer` config do it — check [`playwright.config.ts`](../../../playwright.config.ts) before deciding.
5. Run `npm run test:e2e`.

Then answer the question that actually matters: the happy path in [`tests/e2e/happy-path.spec.ts`](../../../tests/e2e/happy-path.spec.ts) types into a CodeMirror editor and clicks by visible text. Which of those steps will break first when someone edits content in `content/`, and is that a flaky test or a correct alarm?

Self-grade:
- Basic: lists commands.
- Solid: includes env vars and server readiness.
- Strong: includes artifacts, retries, flake strategy, and a defensible answer on content-coupled selectors.
