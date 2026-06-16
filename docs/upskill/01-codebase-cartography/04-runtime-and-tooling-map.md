# 04 Runtime And Tooling Map

## Package And Command Tooling

| Tool | Evidence | Role |
| --- | --- | --- |
| pnpm via Corepack | [`package.json`](../../../package.json) has `packageManager`; CI enables Corepack at [`.github/workflows/ci.yml:16-17`](../../../.github/workflows/ci.yml#L16-L17) | Dependency installation |
| npm scripts | [`package.json`](../../../package.json) scripts | Common command interface |
| Next.js | [`package.json`](../../../package.json) dependency and `next dev/build` scripts | Web framework |
| TypeScript strict mode | [`tsconfig.json`](../../../tsconfig.json) | Static contracts |
| Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) and `db:*` scripts | ORM and migrations |
| Vitest | [`vitest.config.ts`](../../../vitest.config.ts), [`tests/unit`](../../../tests/unit) | Unit tests |
| Playwright | [`playwright.config.ts`](../../../playwright.config.ts), [`tests/e2e/happy-path.spec.ts`](../../../tests/e2e/happy-path.spec.ts) | Browser E2E |
| ESLint/Prettier | [`eslint.config.mjs`](../../../eslint.config.mjs), `format` script | Code quality/format |

## Runtime Boundaries

| Runtime | Files | What runs there | Boundary rule |
| --- | --- | --- | --- |
| Browser client | [`src/features/catalog/catalog-client.tsx:1-4`](../../../src/features/catalog/catalog-client.tsx#L1-L4), [`src/features/review/review-session.tsx:1-10`](../../../src/features/review/review-session.tsx#L1-L10) | Local state, event handlers, rendered controls | No direct DB access. |
| Next server components | [`src/app/page.tsx:7-19`](../../../src/app/page.tsx#L7-L19), [`src/app/reviews/page.tsx:8-35`](../../../src/app/reviews/page.tsx#L8-L35) | Server-side data fetch and composition | Avoid browser-only APIs. |
| Server actions | [`src/server/actions.ts:14-48`](../../../src/server/actions.ts#L14-L48) | Mutations from UI to server | Validate inputs and derive user server-side. |
| Node/Prisma | [`src/lib/prisma.ts`](../../../src/lib/prisma.ts), [`prisma/seed.ts:6-12`](../../../prisma/seed.ts#L6-L12) | DB access | Requires `DATABASE_URL`. |
| Browser Web Worker | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | User code execution | Main thread must not run user code. |
| Node worker | [`src/lib/sandbox/node-runner.ts`](../../../src/lib/sandbox/node-runner.ts) | Test-time sandbox execution | Mirrors browser contract for tests. |
| Cron route | [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19) | Due review aggregation stub | Needs auth/protection before production. |

## Environment Variables

Documented in [`.env.example`](../../../.env.example):
- `DATABASE_URL`: Prisma connection.
- `AUTH_SECRET`, `AUTH_URL`: Auth.js runtime.
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: OAuth.
- `EMAIL_SERVER`, `EMAIL_FROM`: magic-link email.
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_ENABLED`: future subscription gating.

Security note: docs should name variables but never include real secret values.

## Verification Notes

- CI commands are anchored at [`.github/workflows/ci.yml:16-21`](../../../.github/workflows/ci.yml#L16-L21).
- Runtime claims are based on `"use client"` markers and server file imports.
