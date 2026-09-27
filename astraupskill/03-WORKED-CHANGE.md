# Keep every nested write on the transaction client

completeLessonForUser captures its client and time once, then starts the transaction. Eligibility is checked before any completion or award write. Inserting LessonCompletion establishes the unique gate. Review seeding and awardActivity receive tx explicitly, and the service returns newlyCompleted true only after the transaction commits.

The award helpers now accept the supplied database client and pass it into deeper quest, progress, ledger, and achievement operations. This propagation is the essential part of the repair: wrapping only the top-level call in a transaction would be cosmetic if nested helpers still used the global client.

The catch branch distinguishes a duplicate completion from recognized temporary contention and all other failures. Duplicate completion calls noAwardSummary with the same selected client. Contention retries the whole operation with the captured clock; unrelated errors propagate. The beforeCommit seam executes after preceding work and intentionally throws in the rollback regression.

Inspect the service excerpt and then follow every helper it calls. Mark each database write with the client used. A single escaped write can produce an XP event or achievement that survives a rejected completion. The test fixture's low daily goal and seeded achievement are designed to exercise those nested paths, rather than proving rollback only for the first inserted row.

## Source excerpt

From [src/server/completion.ts](../src/server/completion.ts).

```ts
export async function completeLessonForUser(
  userId: string,
  lessonId: string,
  options: CompletionOptions = {},
): Promise<CompletionResult> {
  const client = options.client ?? prisma;
  const now = options.now ?? new Date();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await client.$transaction(async (tx) => {
        const lesson = await tx.lesson.findUnique({
          where: { id: lessonId },
          select: { _count: { select: { knowledgeItems: true } } },
        });
        if (!lesson || lesson._count.knowledgeItems === 0) {
          throw new Error("Lesson is not eligible for completion");
        }

        await tx.lessonCompletion.create({ data: { userId, lessonId, createdAt: now } });
        await seedLessonReviewStates(userId, lessonId, now, tx);
        const summary = await awardActivity(userId, "lesson", true, now, tx);
        await options.beforeCommit?.();
        return { newlyCompleted: true, summary };
      });
    } catch (error) {
      if (isCompletionUniqueConflict(error)) {
        return {
          newlyCompleted: false,
          summary: await noAwardSummary(userId, now, client),
        };
      }
      if (isKnownSqliteBusy(error) && attempt < 2) {
        await wait(10 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Completion retry limit reached");
}
```

## Course navigation

[README](README.md) / [01-CODEBASE-MAP](01-CODEBASE-MAP.md) / [02-CONCEPTS](02-CONCEPTS.md) / [03-WORKED-CHANGE](03-WORKED-CHANGE.md) / [04-TESTING-AND-DEBUGGING](04-TESTING-AND-DEBUGGING.md) / [05-PRACTICE](05-PRACTICE.md) / [06-SOLUTIONS-AND-REVIEW](06-SOLUTIONS-AND-REVIEW.md) / [07-TRACE-LAB](07-TRACE-LAB.md) / [VERIFICATION](VERIFICATION.md)
