# 03 Senior Build Projects

## Project 1: Production-Ready Auth And Guest Mode
**Problem statement:** Demo fallback is shared.
**Product value:** Anonymous learners can try safely and migrate progress.
**Likely files:** [`src/server/user.ts`](../../../src/server/user.ts), [`src/lib/auth.ts`](../../../src/lib/auth.ts), Prisma schema.
**Migration plan:** Add guest identity table or signed anonymous id; migrate on sign-in.
**Test plan:** guest isolation, migration, duplicate merge.
**Security plan:** prevent cross-user progress access.
**Rollback:** disable guest migration behind env flag.

## Project 2: Transactional Learning Activity Pipeline
Anchors: [`src/server/actions.ts:18-24`](../../../src/server/actions.ts#L18-L24), [`src/server/review.ts:65-90`](../../../src/server/review.ts#L65-L90).
Value: no partial completion/reward states.
Decisions: transaction boundaries, idempotency keys, retry behavior.
Tests: integration tests with failure injection.

## Project 3: Notification Outbox And Reminder Delivery
Anchors: [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).
Value: real reminders with retry and observability.
Architecture: outbox table, worker/cron processor, provider adapter.
Security: cron secret, no PII in logs.

## Project 4: Full Pro Subscription Enforcement
Anchors: [`prisma/schema.prisma:22-24`](../../../prisma/schema.prisma#L22-L24), [`src/app/courses/[slug]/page.tsx:61-65`](../../../src/app/courses/%5Bslug%5D/page.tsx#L61-L65).
Value: monetization works.
Plan: Stripe webhook, user plan updates, server-side gate, UI messaging.
Rollback: disable enforcement with feature flag.

## Project 5: Content Versioning And Review Continuity
Anchors: [`content/courses/javascript-foundations.json`](../../../content/courses/javascript-foundations.json), [`prisma/seed.ts:41-73`](../../../prisma/seed.ts#L41-L73).
Value: content can evolve without wiping learner review history.
Plan: stable ids, versions, migration script.
Risk: duplicate/stale KnowledgeItems.

## Project 6: Observability Baseline
Anchors: server actions and cron route.
Value: maintainers know when learning flows break.
Plan: structured logs, error boundary, health route, dashboard metrics.
Rollback: log-level config.

## Project 7: Secure Exercise Execution V2
Anchors: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76).
Value: more trustworthy exercise grading.
Decisions: client vs server execution, hidden tests, language runners.
Performance: CPU quotas and queueing.

## Project 8: Org/Tenant Model
Anchors: [`prisma/schema.prisma:238-247`](../../../prisma/schema.prisma#L238-L247).
Value: team/admin tier.
Security: tenant isolation, admin permissions, invite model.
Tests: IDOR and cross-org rejection.
