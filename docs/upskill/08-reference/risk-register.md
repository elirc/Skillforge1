# Risk Register

| Risk | Evidence | File anchors | Impact | Likelihood | Suggested test | Suggested fix | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shared guest user | Demo fallback | [`src/server/user.ts:11-21`](../../../src/server/user.ts#L11-L21) | Privacy/state mixing | High if deployed | Two anonymous sessions | Env-gate or isolated guest ids | High |
| Cron route unprotected | No auth check | [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19) | Abuse/query load | Medium | Unauthorized request test | Shared secret/header | High |
| Client-supplied correctness | UI sends `correct` | [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66) | XP gaming | Medium | malicious action test | Server-grade MCQ/cloze | High |
| Non-transactional review grading | Separate update/insert/award | [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90) | Partial state | Medium | fault injection | `prisma.$transaction` | Medium |
| Non-transactional lesson completion | Separate completion/seed/reward | [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24) | Partial state | Medium | integration test | transaction/recovery | Medium |
| Pro gating display-only | UI message only | [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65) | Revenue/access leak | High once Pro launches | Core user lesson access test | server-side gate | High |
| Hidden tests shipped to client | Code payload in lesson UI | [`src/features/lessons/code-exercise.tsx:52-56`](../../../src/features/lessons/code-exercise.tsx#L52-L56) | Cheating | Medium | inspect bundle/data | server-side grading | Medium |
| Seed deletes content tree | Delete modules by course | [`prisma/seed.ts:41-42`](../../../prisma/seed.ts#L41-L42) | Review history loss if misused | Low in dev, high in prod | seed on existing progress | stable ids/versioning | High |
| Naive equality in sandbox | JSON stringify compare | [`src/lib/sandbox/shared.ts:44-45`](../../../src/lib/sandbox/shared.ts#L44-L45) | False pass/fail | Medium | object/NaN tests | deep equality helper | High |
| CI lacks E2E/DB | CI only lint/type/content/unit | [`.github/workflows/ci.yml:18-21`](../../../.github/workflows/ci.yml#L18-L21) | Integration regressions | Medium | CI E2E job | Postgres service + Playwright | High |
