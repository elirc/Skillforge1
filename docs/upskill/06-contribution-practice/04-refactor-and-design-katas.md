# 04 Refactor And Design Katas

## Kata 1: Identify A Boundary Leak
Use [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66). Propose how to move correctness authority server-side.

## Kata 2: Propose An Outbox
Use [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19). Design NotificationOutbox schema and processor.

## Kata 3: Split A Large Client Component
Use [`src/features/review/review-session.tsx`](../../../src/features/review/review-session.tsx). Identify subcomponents without changing behavior.

## Kata 4: Improve Type Safety
Use [`src/server/review.ts:9-15`](../../../src/server/review.ts#L9-L15). Replace casts with explicit mapping and exhaustive checks.

## Kata 5: Design A Migration
Add stable content ids to KnowledgeItem. Include migration, seed changes, rollback, and data preservation.

## Kata 6: Reduce N+1/Overfetch
Use [`src/features/review/queries.ts:10-21`](../../../src/features/review/queries.ts#L10-L21). Propose DTO query and indexes.

## Kata 7: Write An RFC
Topic: "Server-derived review correctness." Include problem, options, decision, risks, rollout.

## Kata 8: Review A Flawed PR
Use review katas in [04-code-reading-gym/04-review-katas.md](../04-code-reading-gym/04-review-katas.md). Write comments by severity.

Self-grading:
- Basic: names the issue.
- Solid: proposes a low-risk design.
- Strong: includes migration, tests, rollback, and maintainer communication.
