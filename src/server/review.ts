import { Prisma, type PrismaClient, type ReviewState } from "@prisma/client";
import { z } from "zod";
import { scheduleReview, type RecallScore, type SrsReviewState } from "@/lib/srs/scheduler";
import { prisma } from "@/lib/prisma";
import { knowledgeItemSchema } from "@/lib/content-schema";
import { parseTags } from "@/lib/enums";
import { gradeResponse } from "@/lib/grading";
import { awardActivity, type AwardSummary } from "@/server/gamification";
import { withSqliteBusyRetry } from "@/server/db-retry";
import { gradeCode } from "@/server/grade-code";

export const recallScoreSchema = z.enum(["again", "hard", "good", "easy"]);

type DbClient = Prisma.TransactionClient | PrismaClient;

function toStoredRecall(score: RecallScore) {
  return score.toUpperCase();
}

function toStoredState(state: SrsReviewState["state"]) {
  return state.toUpperCase();
}

export async function seedLessonReviewStates(
  userId: string,
  lessonId: string,
  now = new Date(),
  client: DbClient = prisma,
) {
  const items = await client.knowledgeItem.findMany({ where: { lessonId, archived: false } });
  for (const item of items) {
    await client.reviewState.upsert({
      where: { userId_knowledgeItemId: { userId, knowledgeItemId: item.id } },
      update: {},
      create: {
        userId,
        knowledgeItemId: item.id,
        dueAt: now,
        stability: 0,
        difficulty: 5,
        interval: 0,
        state: "NEW",
      },
    });
  }
}

export interface GradeReviewInput {
  userId: string;
  reviewStateId: string;
  response: unknown;
  recallScore: RecallScore;
  durationMs: number;
}

export interface GradeReviewOptions {
  client?: PrismaClient;
  now?: Date;
  /** Test seam used to prove all preceding writes roll back together. */
  beforeCommit?: () => void | Promise<void>;
}

export interface GradeReviewResult {
  state: ReviewState;
  summary: AwardSummary;
  correct: boolean;
  expected: string;
}

/**
 * Grades one review card. Correctness is derived here from the stored
 * knowledge item -- any client claim is ignored -- and an "again" recall is
 * always incorrect. The reschedule, the attempt row, and the award commit
 * together or not at all.
 */
export async function gradeReviewItem(
  input: GradeReviewInput,
  options: GradeReviewOptions = {},
): Promise<GradeReviewResult> {
  const client = options.client ?? prisma;
  const now = options.now ?? new Date();
  const source = await client.reviewState.findFirstOrThrow({ where: { id: input.reviewStateId, userId: input.userId, knowledgeItem: { archived: false } }, include: { knowledgeItem: true } });
  let codePassed = false;
  if (source.knowledgeItem.type === "CODE") {
    const item = knowledgeItemSchema.parse({ ...source.knowledgeItem, conceptTags: parseTags(source.knowledgeItem.conceptTags) });
    const response = z.object({ code: z.string().max(50_000), assisted: z.boolean().optional() }).safeParse(input.response);
    if (item.type === "CODE" && response.success && !response.data.assisted && input.recallScore !== "again") {
      codePassed = (await gradeCode({ code: response.data.code, functionName: item.payload.functionName, tests: item.payload.tests, regression: item.payload.regression, typeChecks: item.payload.typeChecks }, item.payload.language)).passed;
    }
  }

  return withSqliteBusyRetry(() =>
    client.$transaction(async (tx) => {
      const state = await tx.reviewState.findFirstOrThrow({
        where: { id: input.reviewStateId, userId: input.userId },
        include: { knowledgeItem: true },
      });

      const item = knowledgeItemSchema.parse({
        type: state.knowledgeItem.type,
        prompt: state.knowledgeItem.prompt,
        payload: state.knowledgeItem.payload,
        conceptTags: parseTags(state.knowledgeItem.conceptTags),
      });
      const graded = gradeResponse(item, input.response, input.recallScore);
      const correct = (item.type === "CODE" ? codePassed : graded.correct) && input.recallScore !== "again";
      const effectiveRecall = correct ? input.recallScore : "again";

      const next = scheduleReview(
        {
          dueAt: state.dueAt,
          stability: state.stability,
          difficulty: state.difficulty,
          interval: state.interval,
          lapses: state.lapses,
          reps: state.reps,
          lastReviewedAt: state.lastReviewedAt,
          state: state.state.toLowerCase() as SrsReviewState["state"],
        },
        effectiveRecall,
        now,
      );

      const updated = await tx.reviewState.update({
        where: { id: state.id },
        data: {
          dueAt: next.dueAt,
          stability: next.stability,
          difficulty: next.difficulty,
          interval: next.interval,
          lapses: next.lapses,
          reps: next.reps,
          lastReviewedAt: next.lastReviewedAt,
          state: toStoredState(next.state),
        },
      });

      await tx.attempt.create({
        data: {
          userId: input.userId,
          knowledgeItemId: state.knowledgeItemId,
          response:
            input.response === undefined || input.response === null
              ? Prisma.JsonNull
              : (input.response as Prisma.InputJsonValue),
          correct,
          recallScore: toStoredRecall(effectiveRecall),
          durationMs: input.durationMs,
          createdAt: now,
        },
      });

      const summary = await awardActivity(input.userId, "review", correct, now, tx);
      await options.beforeCommit?.();
      return { state: updated, summary, correct, expected: graded.expected };
    }),
  );
}
