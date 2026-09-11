# Risk Register

This register was first written against the multi-tenant SaaS version of this
codebase. The app has since been rewritten as a local-only, single-learner
trainer. Rather than delete the old entries — a risk register that quietly
forgets what it once said is not worth much — they are kept below, marked
closed, with the reason.

## Active Risks

| Risk | Evidence | File anchors | Impact | Likelihood | Suggested test | Suggested fix | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Client-supplied correctness | UI computes and sends `correct` | [`src/features/review/review-session.tsx:59-70`](../../../src/features/review/review-session.tsx#L59-L70) | The learner can inflate their own XP; the ledger stops reflecting real recall | Medium | Action test asserting `correct: true` on a wrong answer | Server derives MCQ/cloze correctness in `gradeReviewItem` | High |
| Non-transactional review grading | Separate update / insert / award | [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91) | Card rescheduled with no attempt behind it | Medium | Fault injection | `prisma.$transaction` | Medium |
| Non-transactional progress award | XP, XpEvent, quests, achievements, bonuses are separate writes | [`src/server/gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123) | Quest progress with no XP event; ring and profile disagree | Medium | Integration test with an induced failure mid-pipeline | Transaction or recovery design | Medium |
| Read-then-write XP | `addBonusXp` reads progress, then writes level | [`src/server/gamification.ts:41-55`](../../../src/server/gamification.ts#L41-L55) | Lost increment with two tabs open | Low-Medium | Concurrent award test | Atomic `increment`, derive level from the returned value | Medium |
| Non-transactional lesson completion | Separate completion / seed / reward | [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40) | Partial state | Medium | Integration test | Transaction or recovery | Medium |
| Hidden tests shipped to the client | Full test list is serialized into the harness the browser runs | [`src/lib/sandbox/shared.ts:33-46`](../../../src/lib/sandbox/shared.ts#L33-L46) | "Hidden" means not displayed, not unavailable | Medium | Inspect the harness source or the page data | Server-side grading, or stop calling them hidden | High |
| Sandbox escapes are a denylist | Known globals are overwritten, not removed from the scope | [`src/lib/sandbox/shared.ts:38-42`](../../../src/lib/sandbox/shared.ts#L38-L42) | Unknown capability surface in the worker | Medium | Enumerate the worker scope | Document the threat model; isolate rather than blocklist | Medium |
| Naive equality in the sandbox | JSON stringify comparison | [`src/lib/sandbox/shared.ts:44-46`](../../../src/lib/sandbox/shared.ts#L44-L46) | False pass/fail on property order, NaN, undefined | Medium | Object/NaN tests | Deep equality helper | High |
| Position is content identity | Seed upserts by `course+order`, `module+order`, `lesson+order` | [`prisma/seed.ts:28-92`](../../../prisma/seed.ts#L28-L92) | Reordering lessons silently re-points review history | Medium | Re-seed after reordering, then inspect `ReviewState` | Author-supplied stable ids | High |
| No backup, no migration history | Schema is applied with `prisma db push`; a destructive change needs `--force-reset` | [`prisma/schema.prisma`](../../../prisma/schema.prisma), `db:reset` in `package.json` | Total, unrecoverable loss of learner progress | Medium | Attempt a destructive change on a populated database | Progress export/import; back up `data/skillforge.db` before schema work | High |
| Silent enum fallbacks | `.catch()` defaults on stored strings | [`src/server/user.ts:34-36`](../../../src/server/user.ts#L34-L36), [`src/lib/enums.ts`](../../../src/lib/enums.ts) | A bad row changes the feed and quests with no error | Low | Write an invalid value, observe | Log or surface the fallback | Medium |
| CI lacks E2E | CI seeds SQLite, then lint / typecheck / content / unit / build | [`.github/workflows/ci.yml:22-28`](../../../.github/workflows/ci.yml#L22-L28) | Integration regressions | Medium | CI E2E job | Add `test:e2e`; no database service container is needed | High |

## Closed By The Local-Only Rewrite

These were live risks against the earlier SaaS build. They are recorded as
closed because the subsystem they described no longer exists — not because
anyone fixed them.

| Risk (as originally written) | Why it is closed |
| --- | --- |
| Shared guest user — demo fallback in `src/server/user.ts` mixed anonymous learners' state | There is no guest mode and no fallback. There is exactly one learner row, id `"local"`, upserted by [`getCurrentUser()`](../../../src/server/user.ts#L21-L40). |
| Cron route unprotected — `src/app/api/cron/reviews/route.ts` had no auth check | The route and the entire `src/app/api/` tree are gone. Nothing is scheduled; time-based state is computed at read time. |
| Pro gating display-only — the course page showed a Pro badge it did not enforce | `Course` has no `isPro` field, the content schema has no tier, and there is no billing. |
| Seed deletes the content tree — modules were deleted and recreated per course | The seed now upserts against position keys, and [`prisma/seed.ts:28-33`](../../../prisma/seed.ts#L28-L33) explains why. The residual risk is listed above as "Position is content identity". |
| CI lacks a database — E2E needed a Postgres service container | Superseded: CI creates and seeds a SQLite file with `db:setup`. The remaining gap is E2E itself, listed above. |
