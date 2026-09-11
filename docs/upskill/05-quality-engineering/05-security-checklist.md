# 05 Security Checklist

This app has no login, no network surface beyond localhost, and one user. That removes most of the classic web threat model and leaves one genuinely interesting boundary: it runs code the learner wrote. Read the list below with that proportion in mind — the sandbox rows are the real ones, and the rest are habits worth keeping sharp for codebases where they bite.

## Repo-Specific Risks

| Risk | Evidence | Checklist |
| --- | --- | --- |
| Code execution boundary | Harness built in [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76) and run via [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) / [`node-runner.ts`](../../../src/lib/sandbox/node-runner.ts) | Treat the worker as isolation, not as a complete sandbox. Know what it does not claim to stop. |
| Escape-hatch removal is a fence, not a wall | `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` are overwritten in [`src/lib/sandbox/shared.ts:38-42`](../../../src/lib/sandbox/shared.ts#L38-L42) | Deleting known globals is a denylist. Enumerate what else the worker scope exposes before calling it safe. |
| Runaway code | 2s default timeout in [`src/lib/sandbox/client-runner.ts:9-15`](../../../src/lib/sandbox/client-runner.ts#L9-L15), covered by [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27) | Every execution path has a bounded budget and terminates the worker, not just rejects the promise. |
| Hidden tests leaking | `hidden` flag on tests in [`src/lib/sandbox/shared.ts:3-8`](../../../src/lib/sandbox/shared.ts#L3-L8) | The full test list is serialized into the harness the client runs. Assume anything sent to the browser is readable. |
| Input validation | Zod at every action boundary: [`src/server/actions.ts:19-85`](../../../src/server/actions.ts#L19-L85), [`src/server/problems.ts:9-19`](../../../src/server/problems.ts#L9-L19) | Validate every server boundary; bound sizes (`code` is capped at 50,000 chars) and ranges (`durationMs` at 10 minutes). |
| Client-asserted facts | `correct` is computed in the browser and sent in [`src/features/review/review-session.tsx:59-70`](../../../src/features/review/review-session.tsx#L59-L70) | The server should derive anything that decides a reward. |
| Identity is derived, never supplied | [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40) | No action accepts a `userId` from its caller. Keep it that way even though there is only one. |
| IDOR habit | User filter in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49) | Every learner-owned read and write scopes by `userId`, even when it cannot currently matter. |
| XSS | Course prose rendered as text in [`src/features/lessons/lesson-player.tsx:69-81`](../../../src/features/lessons/lesson-player.tsx#L69-L81) | Avoid `dangerouslySetInnerHTML`. Seeded content is authored locally, but it is still data flowing into the DOM. |
| Secrets | `.env.example` holds only `DATABASE_URL` | There are no API keys here. If a change adds one, that is a new dependency and a new disclosure surface — say so in the PR. |
| Data loss, not data theft | `npm run db:reset` and destructive `prisma db push` | The realistic bad day here is an erased `data/skillforge.db`, not a breach. Back it up before schema surgery. |
| Dependency risk | `pnpm-lock.yaml` | Keep the lockfile honest; audit before adding anything that touches the sandbox. |

## Pre-Merge Security Checklist

- [ ] Is every durable mutation server-side?
- [ ] Does every learner-owned read/write scope by `userId`?
- [ ] Does the server derive authority-sensitive facts, rather than accepting them?
- [ ] Does all progress still flow through `awardActivity`?
- [ ] Are secrets read from env and never logged?
- [ ] Does untrusted content render as text?
- [ ] Is learner code isolated and timeout-limited on every runner it can reach?
- [ ] Did this change widen what the sandbox can touch?
- [ ] Are tests covering the failure case, not just the happy path?

## Drill

Take the sandbox harness in [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76) and write the threat model it implies. Name three things a learner's code could still do inside that worker, say which of them matter on a local single-user machine and which would matter the moment this ran on a server, and pick the one change that would close the largest gap for the least complexity.
