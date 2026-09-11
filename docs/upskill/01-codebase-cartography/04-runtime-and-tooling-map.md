# 04 Runtime And Tooling Map

## Package And Command Tooling

| Tool | Evidence | Role |
| --- | --- | --- |
| pnpm via Corepack | [`package.json`](../../../package.json) has `packageManager`; CI enables Corepack at [`.github/workflows/ci.yml:16`](../../../.github/workflows/ci.yml#L16) | Dependency installation |
| npm scripts | [`package.json`](../../../package.json) scripts | Common command interface |
| Next.js | [`package.json`](../../../package.json) dependency and `next dev/build` scripts | Web framework |
| TypeScript strict mode | [`tsconfig.json`](../../../tsconfig.json) | Static contracts |
| Prisma (SQLite) | [`prisma/schema.prisma`](../../../prisma/schema.prisma) and `db:*` scripts | ORM and schema push (`prisma db push`; there is no migrations directory) |
| Vitest | [`vitest.config.ts`](../../../vitest.config.ts), [`tests/unit`](../../../tests/unit) | Unit tests |
| Playwright | [`playwright.config.ts`](../../../playwright.config.ts), [`tests/e2e/happy-path.spec.ts`](../../../tests/e2e/happy-path.spec.ts) | Browser E2E |
| ESLint/Prettier | [`eslint.config.mjs`](../../../eslint.config.mjs), `format` script | Code quality/format |

## Runtime Boundaries

| Runtime | Files | What runs there | Boundary rule |
| --- | --- | --- | --- |
| Browser client | [`src/features/catalog/catalog-client.tsx:1-4`](../../../src/features/catalog/catalog-client.tsx#L1-L4), [`src/features/review/review-session.tsx:1-10`](../../../src/features/review/review-session.tsx#L1-L10) | Local state, event handlers, rendered controls | No direct DB access. |
| Next server components | [`src/app/page.tsx:7-19`](../../../src/app/page.tsx#L7-L19), [`src/app/reviews/page.tsx:8-35`](../../../src/app/reviews/page.tsx#L8-L35) | Server-side data fetch and composition | Avoid browser-only APIs. |
| Server actions | [`src/server/actions.ts:23-104`](../../../src/server/actions.ts#L23-L104) | Mutations from UI to server | Validate inputs with Zod and resolve the learner server-side via `getCurrentUser()`. |
| Node/Prisma | [`src/lib/prisma.ts`](../../../src/lib/prisma.ts), [`prisma/seed.ts`](../../../prisma/seed.ts) | DB access against the local SQLite file | Requires `DATABASE_URL`. |
| Browser Web Worker | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | User code execution | Main thread must not run user code. |
| Node worker | [`src/lib/sandbox/node-runner.ts`](../../../src/lib/sandbox/node-runner.ts) | Test-time sandbox execution | Mirrors browser contract for tests. |
| Node CLI (content pipeline) | [`scripts/validate-content.ts:25-48`](../../../scripts/validate-content.ts#L25-L48) | Assembles every course/problem from `content/` and executes each reference solution in the Node sandbox | Runs outside Next; only imports modules that work in plain Node. |

## Environment Variables

[`.env.example`](../../../.env.example) documents exactly one variable, and that is the whole configuration surface:

- `DATABASE_URL`: Prisma connection string. It points at the local SQLite file, `file:../data/skillforge.db` (the path is relative to `prisma/`).

There is no auth, OAuth, email, or payment configuration, because none of those subsystems exist in this build. If you find yourself reaching for a second environment variable, that is a signal you are adding a new external dependency — say so explicitly in the PR.

Security note: docs should name variables but never include real secret values.

## Verification Notes

- CI commands are anchored at [`.github/workflows/ci.yml:13-28`](../../../.github/workflows/ci.yml#L13-L28): install, `db:setup` against a throwaway SQLite file, lint, typecheck, `validate:content`, unit tests, build.
- Runtime claims are based on `"use client"` markers and server file imports.
