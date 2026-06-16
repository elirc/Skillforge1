# 02 Writing Tests Here

## Recipe 1: Pure Scheduler Happy Path

Read [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44). Add a case with a high-stability card and `easy` recall.

Command:
```bash
npm test -- tests/unit/srs.test.ts
```

## Recipe 2: Validation Failure

Target: [`src/server/actions.ts:32-41`](../../../src/server/actions.ts#L32-L41). Add a unit test around schema extraction if schemas are exported, or refactor carefully to export validation helpers.

Acceptance: invalid `recallScore` rejects.

## Recipe 3: Permission Failure

Target: [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49). Integration test with two users and one ReviewState should prove user B cannot grade user A's state.

## Recipe 4: Async Side Effect

Target: [`src/server/gamification.ts:50-68`](../../../src/server/gamification.ts#L50-L68). Seed progress and completions, call unlock, assert badge exists once.

## Recipe 5: Cache/Revalidation

Target: [`src/server/actions.ts:26-28`](../../../src/server/actions.ts#L26-L28). Hard to unit-test directly; prefer route-level E2E or mock `revalidatePath` if refactoring.

## Recipe 6: Migration/Schema Behavior

Target: [`prisma/schema.prisma:141-142`](../../../prisma/schema.prisma#L141-L142). Integration test duplicate ReviewState upsert does not duplicate rows.

## Recipe 7: UI State

Target: [`src/features/catalog/catalog-client.tsx:30-47`](../../../src/features/catalog/catalog-client.tsx#L30-L47). Component test could verify language/topic filters.

## Recipe 8: Sandbox Timeout

Existing pattern: [`tests/unit/sandbox.test.ts:16-27`](../../../tests/unit/sandbox.test.ts#L16-L27). Add a browser E2E that submits infinite-loop code and expects timeout message.

## Suggested Commands

```bash
npm test
npm test -- tests/unit/sandbox.test.ts
npm run typecheck
npm run validate:content
npm run test:e2e
```
