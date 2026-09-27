# Find escaped writes and overbroad retries

The concurrent pair has one true and one false newlyCompleted result; the later repeat is false. There is one completion, two review states for the fixture, and one lesson XP event. The nested quest and achievement rewards also occur once. The unique learner-and-lesson insertion gates all subsequent award work within the transaction.

After late failure, completion, review, XP, quest, and earned-achievement writes roll back, while the original progress fixture remains at zero XP. Checking the full set matters because an escaped helper write could survive while the completion itself correctly disappears. The fixture deliberately makes nested rewards eligible to expose that mistake.

An empty or missing lesson fails eligibility before the completion insert. It is not a harmless retry. An unrelated P2002 must propagate rather than masquerade as an already-completed lesson; the classifier checks the relevant model and key fields.

Two recognized contention failures followed by success use three transaction attempts and one captured now value. Further contention is surfaced after the bounded attempts. Arbitrary exceptions are not retried. Without the owned marker, the suite stays skipped and its destructive fixture hooks are not enabled.

During review, follow the client argument through every nested award helper, verify the unique gate precedes rewards, and compare stored rows after both success and failure. Browser behavior and lesson correctness require separate evidence and are not established by this persistence suite.

## Source excerpt

From [src/server/completion.ts](../src/server/completion.ts).

```ts
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
