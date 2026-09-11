# 03 Type System And Contracts

## Concept: Compile-Time Type vs Runtime Contract

TypeScript helps during development. Zod validates data at runtime. In this repo, runtime validation appears at server action boundaries, content JSON boundaries, and sandbox request boundaries.

Real examples:
- Content block and knowledge item discriminated unions in [`src/lib/content-schema.ts:3-64`](../../../src/lib/content-schema.ts#L3-L64).
- Full course seed schema in [`src/lib/content-schema.ts:66-90`](../../../src/lib/content-schema.ts#L66-L90).
- Server action schemas in [`src/server/actions.ts:19-21`](../../../src/server/actions.ts#L19-L21), [`src/server/actions.ts:45-51`](../../../src/server/actions.ts#L45-L51), and [`src/server/actions.ts:62-68`](../../../src/server/actions.ts#L62-L68).
- Sandbox request schema in [`src/lib/sandbox/shared.ts:3-14`](../../../src/lib/sandbox/shared.ts#L3-L14).
- Database column decoding in [`src/lib/enums.ts`](../../../src/lib/enums.ts). This one is the odd case worth dwelling on: the data has already been through validation once, on the way in, and it is validated *again* on the way out — because SQLite cannot hold the type, so the boundary is not the network, it is the storage layer.

Note the `.catch()` calls in [`src/server/user.ts:34-35`](../../../src/server/user.ts#L34-L35): `goalSchema.catch("crud-dev").parse(user.goal)`. That is a deliberate choice to degrade to a default rather than throw on a corrupt column. Decide for yourself whether silently repairing bad data is the right call here, and whether it would still be right if the column drove something less cosmetic than feed ordering.

## Discriminated Unions

Concept: A `type` field lets TypeScript narrow payload shape.

Repo example:
- `knowledgeItemSchema` distinguishes `MCQ`, `CLOZE`, and `CODE` in [`src/lib/content-schema.ts:45-64`](../../../src/lib/content-schema.ts#L45-L64).
- Lesson UI branches on `item.type` in [`src/features/lessons/lesson-player.tsx:87-131`](../../../src/features/lessons/lesson-player.tsx#L87-L131).

Failure modes:
- Adding a new knowledge-item type without updating Zod and the UI. Prisma will not help you here: `KnowledgeItem.type` is a `String` column with the valid values written in a trailing comment ([`prisma/schema.prisma:89`](../../../prisma/schema.prisma#L89)). The only real enforcement lives in [`src/lib/enums.ts:11`](../../../src/lib/enums.ts#L11) and the content schema.
- Unsafe casts from JSON to Prisma `InputJsonValue` in seed and review paths; these are pragmatic but should be kept near validation boundaries.

## Contract Table

| Contract | Defined | Consumed | Test |
| --- | --- | --- | --- |
| Course content | [`src/lib/content-schema.ts`](../../../src/lib/content-schema.ts) | [`prisma/seed.ts:11-61`](../../../prisma/seed.ts#L11-L61) | [`scripts/validate-content.ts:25-48`](../../../scripts/validate-content.ts#L25-L48) |
| Review action input | [`src/server/actions.ts:45-51`](../../../src/server/actions.ts#L45-L51) | [`src/features/review/review-session.tsx:60-68`](../../../src/features/review/review-session.tsx#L60-L68) | Indirect E2E [`tests/e2e/happy-path.spec.ts:21-25`](../../../tests/e2e/happy-path.spec.ts#L21-L25) |
| Onboarding/settings input | [`src/server/actions.ts:62-77`](../../../src/server/actions.ts#L62-L77) | [`src/features/onboarding/onboarding-form.tsx`](../../../src/features/onboarding/onboarding-form.tsx), [`src/features/profile/profile-settings.tsx`](../../../src/features/profile/profile-settings.tsx) | None directly |
| String columns -> unions/arrays | [`src/lib/enums.ts`](../../../src/lib/enums.ts) | [`src/server/user.ts:34-36`](../../../src/server/user.ts#L34-L36), [`src/features/catalog/queries.ts:6-13`](../../../src/features/catalog/queries.ts#L6-L13), [`src/server/feed.ts:42`](../../../src/server/feed.ts#L42) | None directly |
| SRS scheduler | [`src/lib/srs/scheduler.ts`](../../../src/lib/srs/scheduler.ts) | [`src/server/review.ts:51-63`](../../../src/server/review.ts#L51-L63) | [`tests/unit/srs.test.ts`](../../../tests/unit/srs.test.ts) |
| Sandbox request/result | [`src/lib/sandbox/shared.ts:3-31`](../../../src/lib/sandbox/shared.ts#L3-L31) | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | [`tests/unit/sandbox.test.ts`](../../../tests/unit/sandbox.test.ts) |

## Drill

Add a hypothetical `TRUE_FALSE` knowledge item. List every file that must change before code changes:
- `knowledgeItemTypeSchema` in [`src/lib/enums.ts`](../../../src/lib/enums.ts).
- The content Zod schema and the trailing comment on the Prisma column (the comment is the only documentation of the allowed values, so it counts).
- Lesson UI renderer.
- Review UI renderer.
- Content loader, if the new type needs files on disk.
- Tests.

Then answer: does the database need to change at all? Say why or why not, and what that tells you about where the real type boundary lives in this codebase.

Self-grade:
- Basic: names one UI file.
- Solid: names the enum module and the UI.
- Strong: recognizes the column is already a `String` so no schema change is needed, and identifies that as both convenient and a place where a bad value can reach production data unchallenged. Names the validation script, tests, and backward-compatibility concerns for rows already seeded.
