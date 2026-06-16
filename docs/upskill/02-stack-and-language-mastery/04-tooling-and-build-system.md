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
| `docker compose up -d` | Not verified here | Local Postgres starts | [`docker-compose.yml`](../../../docker-compose.yml) |
| `npm run test:e2e` | Blocked by Docker/dev DB in this environment | Browser happy path | [`playwright.config.ts`](../../../playwright.config.ts) |

## CI Mental Model

CI installs, lints, typechecks, validates content, and runs unit tests in [`.github/workflows/ci.yml:16-21`](../../../.github/workflows/ci.yml#L16-L21). It does not currently start Postgres or run Playwright E2E. That means CI catches pure logic regressions but not full DB/browser integration.

## Build Pitfalls

- Prisma requires `DATABASE_URL` even for validation in many CLI paths.
- Next build can fail if routes try to prerender DB reads; dynamic routes are marked with `dynamic = "force-dynamic"` in files like [`src/app/page.tsx:5`](../../../src/app/page.tsx#L5).
- pnpm is the lockfile source of truth. npm scripts are still used as a command interface.

## Drill

Design a CI job that runs E2E:
1. Start Postgres service.
2. Set `DATABASE_URL`.
3. Run migrations and seed.
4. Install Playwright browsers.
5. Run `npm run test:e2e`.

Self-grade:
- Basic: lists commands.
- Solid: includes env vars and service readiness.
- Strong: includes artifacts, retries, and flake strategy.
