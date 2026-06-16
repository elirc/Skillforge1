# 03 Type System And Contracts

## Concept: Compile-Time Type vs Runtime Contract

TypeScript helps during development. Zod validates data at runtime. In this repo, runtime validation appears at server action boundaries, content JSON boundaries, and sandbox request boundaries.

Real examples:
- Content block and knowledge item discriminated unions in [`src/lib/content-schema.ts:3-64`](../../../src/lib/content-schema.ts#L3-L64).
- Full course seed schema in [`src/lib/content-schema.ts:66-90`](../../../src/lib/content-schema.ts#L66-L90).
- Server action schemas in [`src/server/actions.ts:10-15`](../../../src/server/actions.ts#L10-L15) and [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41).
- Sandbox request schema in [`src/lib/sandbox/shared.ts:3-14`](../../../src/lib/sandbox/shared.ts#L3-L14).

## Discriminated Unions

Concept: A `type` field lets TypeScript narrow payload shape.

Repo example:
- `knowledgeItemSchema` distinguishes `MCQ`, `CLOZE`, and `CODE` in [`src/lib/content-schema.ts:45-64`](../../../src/lib/content-schema.ts#L45-L64).
- Lesson UI branches on `item.type` in [`src/features/lessons/lesson-player.tsx:87-131`](../../../src/features/lessons/lesson-player.tsx#L87-L131).

Failure modes:
- Adding a new `KnowledgeItemType` enum value in Prisma without updating Zod and UI.
- Unsafe casts from JSON to Prisma `InputJsonValue` in seed and review paths; these are pragmatic but should be kept near validation boundaries.

## Contract Table

| Contract | Defined | Consumed | Test |
| --- | --- | --- | --- |
| Course content JSON | [`src/lib/content-schema.ts:66-90`](../../../src/lib/content-schema.ts#L66-L90) | [`prisma/seed.ts:10-12`](../../../prisma/seed.ts#L10-L12) | [`scripts/validate-content.ts:9-28`](../../../scripts/validate-content.ts#L9-L28) |
| Review action input | [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41) | [`src/features/review/review-session.tsx:60-68`](../../../src/features/review/review-session.tsx#L60-L68) | Indirect E2E [`tests/e2e/happy-path.spec.ts:22-25`](../../../tests/e2e/happy-path.spec.ts#L22-L25) |
| SRS scheduler | [`src/lib/srs/scheduler.ts:4-12`](../../../src/lib/srs/scheduler.ts#L4-L12) | [`src/server/review.ts:51-63`](../../../src/server/review.ts#L51-L63) | [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44) |
| Sandbox request/result | [`src/lib/sandbox/shared.ts:3-31`](../../../src/lib/sandbox/shared.ts#L3-L31) | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | [`tests/unit/sandbox.test.ts:4-28`](../../../tests/unit/sandbox.test.ts#L4-L28) |

## Drill

Add a hypothetical `TRUE_FALSE` knowledge item. List every file that must change before code changes:
- Prisma enum.
- Zod schema.
- Lesson UI renderer.
- Review UI renderer.
- Seed content validation.
- Tests.

Self-grade:
- Basic: names one UI file.
- Solid: names schema and UI.
- Strong: names migrations, validation script, tests, and backward compatibility concerns.
