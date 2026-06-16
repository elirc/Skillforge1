# Command Cheatsheet

| Command | Status | Purpose |
| --- | --- | --- |
| `corepack enable` | Verified | Enable pinned pnpm through Corepack |
| `corepack pnpm install` | Verified earlier | Install dependencies |
| `npm run dev` | Inferred | Start Next dev server |
| `npm run build` | Verified earlier | Production build |
| `npm run lint` | Verified | ESLint |
| `npm run typecheck` | Verified | TypeScript |
| `npm test` | Verified | Unit tests |
| `npm test -- tests/unit/sandbox.test.ts` | Inferred from Vitest | Targeted sandbox tests |
| `npm run validate:content` | Verified | Validate course content and reference code |
| `docker compose up -d` | Blocked: Docker daemon unavailable earlier | Start Postgres |
| `npm run db:migrate` | Inferred | Apply Prisma migrations |
| `npm run db:seed` | Inferred | Seed demo data |
| `npm run test:e2e` | Inferred/blocked by DB | Playwright happy path |
| `corepack pnpm exec prisma validate` | Verified with `DATABASE_URL` | Validate Prisma schema |
| `npm run format` | Inferred | Prettier |
