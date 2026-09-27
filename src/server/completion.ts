import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardActivity, noAwardSummary, type AwardSummary } from "@/server/gamification";
import { seedLessonReviewStates } from "@/server/review";
import { withSqliteBusyRetry } from "@/server/db-retry";

export interface CompletionResult {
  newlyCompleted: boolean;
  summary: AwardSummary;
}

export interface CompletionOptions {
  assisted?: boolean;
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

export async function completeLessonForUser(
  userId: string,
  lessonId: string,
  options: CompletionOptions = {},
): Promise<CompletionResult> {
  const client = options.client ?? prisma;
  const now = options.now ?? new Date();

  try {
    return await withSqliteBusyRetry(() =>
      client.$transaction(async (tx) => {
        const lesson = await tx.lesson.findUnique({
          where: { id: lessonId, archived: false, module: { archived: false, course: { archived: false } } },
          select: { _count: { select: { knowledgeItems: { where: { archived: false } } } } },
        });
        if (!lesson || lesson._count.knowledgeItems === 0) {
          throw new Error("Lesson is not eligible for completion");
        }

        await tx.lessonCompletion.create({ data: { userId, lessonId, assisted: options.assisted ?? false, createdAt: now } });
        await seedLessonReviewStates(userId, lessonId, now, tx);
        const summary = await awardActivity(userId, "lesson", true, now, tx);
        await options.beforeCommit?.();
        return { newlyCompleted: true, summary };
      }),
    );
  } catch (error) {
    if (isCompletionUniqueConflict(error)) {
      return {
        newlyCompleted: false,
        summary: await noAwardSummary(userId, now, client),
      };
    }
    throw error;
  }
}
