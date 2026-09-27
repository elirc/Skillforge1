# Uniqueness and atomicity solve different problems

The unique completion row is the one-award gate. Two requests may both find an eligible lesson, but both cannot insert the same learner-and-lesson pair. The losing request recognizes only the relevant P2002 conflict and returns a summary without adding a second contribution. A unique violation from another model or key must not be silently treated as an already-completed lesson.

Atomicity protects the winner's collection of writes. Completion, review state, XP events, quests, achievements, and progress must either commit together or roll back together. Uniqueness alone cannot prevent a late failure from leaving half of that collection persisted if helper calls use separate clients.

A captured clock makes related timestamps coherent across the operation and across a contention retry. The service passes the same now value into review seeding and award logic. This is a deterministic operation-time choice, not a claim that the system clock is globally monotonic.

Contention retry is bounded and selective. The code recognizes particular Prisma timeout or write-conflict errors with SQLite-related messages, waits briefly, and retries the entire transaction at most three times. It does not retry arbitrary business validation or programming failures. Explain these three mechanisms separately when reviewing a new completion path.

## Source excerpt

From [src/server/completion.ts](../src/server/completion.ts).

```ts
function isCompletionUniqueConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  const meta = error.meta as { modelName?: unknown; target?: unknown } | undefined;
  if (meta?.modelName && meta.modelName !== "LessonCompletion") return false;
  const target = Array.isArray(meta?.target)
    ? meta.target.map(String)
    : typeof meta?.target === "string"
      ? [meta.target]
      : [];
  const joined = target.join("_").toLowerCase();
  return joined.includes("userid") && joined.includes("lessonid");
}

function isKnownSqliteBusy(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return (
    ["P1008", "P2034"].includes(error.code) &&
    /timed out|database is locked|write conflict/i.test(error.message)
  );
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

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
