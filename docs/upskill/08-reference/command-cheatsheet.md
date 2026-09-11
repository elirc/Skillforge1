# Command Cheatsheet

Every script below is defined in `package.json`. The repo pins pnpm through Corepack, and the README uses `npm run` for the scripts themselves; either works.

| Command | Status | Purpose |
| --- | --- | --- |
| `corepack enable` | Verified | Enable pinned pnpm through Corepack |
| `corepack pnpm install` | Verified earlier | Install dependencies |
| `npm run dev` | Inferred | Start the Next dev server |
| `npm run build` | Verified earlier | Production build |
| `npm run start` | Inferred | Serve the production build |
| `npm run lint` | Verified | ESLint |
| `npm run typecheck` | Verified | `tsc --noEmit` |
| `npm run format` | Inferred | Prettier |
| `npm test` | Verified | Vitest unit tests |
| `npm run test:watch` | Inferred | Vitest in watch mode |
| `npm test -- tests/unit/sandbox.test.ts` | Inferred from Vitest | Targeted sandbox tests |
| `npm run test:e2e` | Inferred, needs a seeded DB and a running app | Playwright happy path |
| `npm run validate:content` | Verified | Assemble course content and execute every reference solution |
| `npm run db:generate` | Inferred | `prisma generate` |
| `npm run db:push` | Inferred | `prisma db push` — applies `schema.prisma` to `data/skillforge.db`. There are no migrations and no `db:migrate` script |
| `npm run db:setup` | Verified in CI | generate + push + seed, the one command a fresh checkout needs |
| `npm run db:seed` | Inferred | Re-seed courses, problems, and achievements from `content/`. Learner progress is preserved |
| `npm run db:reset` | Inferred | `prisma db push --force-reset` + seed. **Destroys all learner progress** |
| `npm run db:studio` | Inferred | Browse `data/skillforge.db` in Prisma Studio |
| `corepack pnpm exec prisma validate` | Verified with `DATABASE_URL` | Validate the Prisma schema |

There is no Docker, no database server to start, and no deploy command. `DATABASE_URL` points at a SQLite file; see `.env.example`.
