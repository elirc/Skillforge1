# Commit a lesson and its rewards together

Skillforge completion is more than a checkbox. A completed lesson seeds review items, updates learner progress, records XP, advances quests, and may unlock an achievement. If these writes happen independently, a late failure can leave a completed lesson without its rewards or a reward without the matching completion. Retried requests can also award the same lesson twice.

The new completion service makes this one transactional decision. It checks lesson eligibility, inserts the unique learner-and-lesson completion, seeds review state, and calls the award helpers with the same transaction client and captured time. A duplicate completion returns a no-award summary. Recognized SQLite contention receives a small bounded retry; unrelated failures remain errors.

This course traces that service and the real temporary-SQLite tests. Read the map to find the authenticated action and nested helpers, then Concepts to distinguish uniqueness from rollback. The worked change explains client propagation. Practice and its separate answer chapter focus on concurrent requests and failures after nested quest or achievement writes.

The verification scope is local persistence and award behavior. It does not execute a lesson in an external code runner, certify browser interaction, or assess a learner's knowledge. The isolated helper and ownership guard keep these destructive fixture tests away from an ordinary application database.

## Source excerpt

From [src/server/completion.ts](../src/server/completion.ts).

```ts
import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardActivity, noAwardSummary, type AwardSummary } from "@/server/gamification";
import { seedLessonReviewStates } from "@/server/review";

export interface CompletionResult {
  newlyCompleted: boolean;
  summary: AwardSummary;
}

export interface CompletionOptions {
  client?: PrismaClient;
  now?: Date;
  /** Test seam used to prove all preceding writes roll back together. */
  beforeCommit?: () => void | Promise<void>;
}

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
