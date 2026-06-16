# 05 Security Checklist

## Repo-Specific Risks

| Risk | Evidence | Checklist |
| --- | --- | --- |
| Authorization/IDOR | Good user filter in [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49) | Every user-owned mutation includes user/org filter |
| Pro access bypass | Display-only gate in [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65) | Enforce plan server-side |
| Shared guest state | [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21) | Disable in production or isolate guests |
| Input validation | Zod in [`src/server/actions.ts:10-41`](../../../src/server/actions.ts#L10-L41) | Validate every server boundary |
| XSS | Course prose rendered as text in [`src/features/lessons/lesson-player.tsx:69-81`](../../../src/features/lessons/lesson-player.tsx#L69-L81) | Avoid `dangerouslySetInnerHTML` |
| User code execution | Harness in [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76) | Treat worker as isolation, not complete sandbox |
| CSRF | Server actions/Auth.js defaults | Confirm framework protections before production |
| Secrets | Env docs in `.env.example` | Never commit real secrets |
| Cron abuse | [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19) | Add auth header/shared secret |
| Dependency risk | `pnpm-lock.yaml` | Dependabot/Snyk or npm audit policy |

## Pre-Merge Security Checklist

- [ ] Is every durable mutation server-side?
- [ ] Does every user-owned read/write scope by user or org?
- [ ] Does the server derive authority-sensitive facts?
- [ ] Are route handlers protected if not public?
- [ ] Are secrets read from env and never logged?
- [ ] Does untrusted content render as text?
- [ ] Is user code isolated and timeout-limited?
- [ ] Are tests covering permission failure?

## Drill

Pick `gradeReviewAction`. Write a malicious request and explain which line blocks it, which line does not, and what extra validation you would add.
