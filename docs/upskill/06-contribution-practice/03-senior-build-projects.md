# 03 Senior Build Projects

## Project 1: Progress Durability
**Problem statement:** Every piece of learner progress lives in one unversioned SQLite file at `data/skillforge.db`. There is no migration history, and a destructive `prisma db push` asks for `--force-reset`, which drops it.
**Product value:** Months of streak and review history stop being one keystroke from gone.
**Likely files:** [`src/server/actions.ts:88-104`](../../../src/server/actions.ts#L88-L104) (the authoritative list of learner tables), [`prisma/schema.prisma`](../../../prisma/schema.prisma), [`src/features/profile/profile-settings.tsx`](../../../src/features/profile/profile-settings.tsx).
**Migration plan:** Export keyed by content slug and item position rather than cuid, so a restore survives a re-seed.
**Test plan:** export, `db:reset`, import, assert XP, streak, and every `ReviewState` due date round-trip.
**Security plan:** the export contains the learner's entire history; decide where it is written and whether it is ever offered over HTTP.
**Rollback:** import is additive-off by default; nothing overwrites without an explicit confirm.

## Project 2: Transactional Learning Activity Pipeline
Anchors: [`src/server/actions.ts:27-40`](../../../src/server/actions.ts#L27-L40), [`src/server/review.ts:65-91`](../../../src/server/review.ts#L65-L91), [`src/server/gamification.ts:61-123`](../../../src/server/gamification.ts#L61-L123).
Value: no partial completion or reward states — never an advanced review card with no attempt behind it, never quest progress with no XP event.
Decisions: transaction boundaries, whether `awardActivity` joins the caller's transaction or owns its own, idempotency keys.
Tests: integration tests with failure injection against a throwaway database file.

## Project 3: Time As An Input
Anchors: [`src/lib/gamification.ts:97-156`](../../../src/lib/gamification.ts#L97-L156), [`src/server/quests.ts:31-56`](../../../src/server/quests.ts#L31-L56), [`src/server/feed.ts:134-197`](../../../src/server/feed.ts#L134-L197).
Value: everything time-dependent — streak, freezes, the daily quest roll, the due queue — is currently evaluated whenever something asks. There is no cron and no worker, which is the right call; the risk is that "what day is it" is answered in several places.
Architecture: one place that decides the local day, threaded as a parameter; an explicit rule for what happens when the app is left open across midnight.
Tests: fixed clocks across a DST boundary, a two-day gap consuming exactly one freeze, a three-day gap resetting the streak.

## Project 4: Mastery Model
Anchors: [`getWeakConcepts`](../../../src/server/feed.ts#L34-L58), [`conceptStrength`](../../../src/lib/srs/scheduler.ts), [`src/app/tracks/page.tsx`](../../../src/app/tracks/page.tsx).
Value: the learner's real question is "what am I bad at", and the data to answer it already exists but is only used to bias a single problem recommendation.
Plan: a first-class concept-mastery read model, surfaced on `/tracks`, driving both the feed and the quest board.
Risk: a nested `include` over every `ReviewState` on every render; decide where this is computed and how often.

## Project 5: Content Versioning And Review Continuity
Anchors: [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json), [`prisma/seed.ts:28-92`](../../../prisma/seed.ts#L28-L92), [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts).
Value: content can evolve without wiping review history.
Current state: the seed already upserts by position key so ids survive, and the comment at [`prisma/seed.ts:28-33`](../../../prisma/seed.ts#L28-L33) explains why. What is still fragile is that position *is* identity — reordering lessons re-points history.
Plan: author-supplied stable ids, a content version, and a reconciliation step for existing rows.

## Project 6: Observability Baseline, Local-Sized
Anchors: [`src/server/actions.ts`](../../../src/server/actions.ts), [`src/server/gamification.ts`](../../../src/server/gamification.ts), [`src/lib/sandbox/`](../../../src/lib/sandbox).
Value: when a learning flow breaks on one machine, the learner is the only reporter and "it didn't give me XP" is the whole bug report.
Plan: structured logs at the three progress write paths, error boundaries on the major routes, the seed summary surfaced in the UI.
Non-goals: health routes, metrics dashboards, alerting. There is no service to page anyone about.
Rollback: log-level config.

## Project 7: Secure Exercise Execution V2
Anchors: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76), [`client-runner.ts`](../../../src/lib/sandbox/client-runner.ts), [`node-runner.ts`](../../../src/lib/sandbox/node-runner.ts).
Value: more trustworthy exercise grading, and honest hidden tests — today the full test list is serialized into the harness the browser runs.
Decisions: client versus server execution, where hidden tests live, and how a second language runner would work given that only JavaScript is supported now.
Performance: CPU quotas and queueing if execution ever moves off the learner's own machine.

## Project 8: A Second Learner
Anchors: [`src/server/user.ts:8-40`](../../../src/server/user.ts#L8-L40), and every `where: { userId }` in `src/server/` and `src/features/`.
Value: this is the design exercise the codebase was built to support — `LOCAL_USER_ID` is a single constant, and every query is already scoped by `userId`, so the question is what *else* would have to change.
Plan: enumerate every place identity is assumed rather than passed; decide what authentication would look like and whether it belongs here at all.
Security: this is where IDOR guards like [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49) stop being decorative.
Tests: cross-user rejection on every learner-owned read and write.
**Write the RFC that argues against doing it.** A senior engineer's most valuable output here may be a clear case that this app should stay single-user, and what that costs.
