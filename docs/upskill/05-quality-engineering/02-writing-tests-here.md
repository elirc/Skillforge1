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

## What already exists (check before writing a new test)

`tests/unit/` currently holds 16 Vitest files and `tests/e2e/` two Playwright specs. Several recipes above are
already partly covered — read these first:

| Recipe | Existing coverage to extend |
| --- | --- |
| 1 Scheduler | `tests/unit/srs.test.ts` |
| 2-3 Validation / permission | `tests/unit/review-grading.test.ts`, `tests/unit/grading.test.ts` (server-side grading now decides correctness, so test *its* inputs) |
| 4 Async side effect | `tests/unit/gamification.test.ts`, `tests/unit/completion.test.ts` (repeat completion and transaction behaviour) |
| 6 Schema behaviour | `tests/unit/completion.test.ts`, `tests/unit/backup-db.test.ts`. `npm run test:db` runs `completion`, `review-grading`, `content-reliability` (via `scripts/test-completion-local.mjs`) and `backup-db` (via `scripts/test-backup-local.mjs`) against throwaway local SQLite files |
| 8 Sandbox / runners | `tests/unit/sandbox.test.ts`, `tests/unit/csharp-runner.test.ts`, `tests/unit/runtime-diagnostics.test.ts` |
| Content | `tests/unit/content-reliability.test.ts` and `npm run validate:content` |
| End to end | `tests/e2e/happy-path.spec.ts`, `tests/e2e/improvements.spec.ts` (`npm run test:e2e` runs `scripts/test-e2e-local.mjs`) |

Line anchors in the recipes above predate commit `b9b79b5`; re-locate the function before adding a case.

**Check:** before writing a new test for any recipe, name the existing test file you would extend and the single
behaviour your new case adds that no current assertion covers.
