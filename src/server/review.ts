import { Prisma } from "@prisma/client";
import { z } from "zod";
import { scheduleReview, type RecallScore, type SrsReviewState } from "@/lib/srs/scheduler";
import { prisma } from "@/lib/prisma";
import { awardActivity } from "@/server/gamification";

export const recallScoreSchema = z.enum(["again", "hard", "good", "easy"]);

function toStoredRecall(score: RecallScore) {
  return score.toUpperCase();
}

function toStoredState(state: SrsReviewState["state"]) {
  return state.toUpperCase();
}

export async function seedLessonReviewStates(userId: string, lessonId: string) {
  const items = await prisma.knowledgeItem.findMany({ where: { lessonId } });
  const now = new Date();
  await Promise.all(
    items.map((item) =>
      prisma.reviewState.upsert({
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
      }),
    ),
  );
}

export async function gradeReviewItem(input: {
  userId: string;
  reviewStateId: string;
  response: unknown;
  correct: boolean;
  recallScore: RecallScore;
  durationMs: number;
}) {
  const state = await prisma.reviewState.findFirstOrThrow({
    where: { id: input.reviewStateId, userId: input.userId },
  });

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
    input.recallScore,
  );

  const updated = await prisma.reviewState.update({
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

  await prisma.attempt.create({
    data: {
      userId: input.userId,
      knowledgeItemId: state.knowledgeItemId,
      response: input.response as Prisma.InputJsonValue,
      correct: input.correct,
      recallScore: toStoredRecall(input.recallScore),
      durationMs: input.durationMs,
    },
  });

  const summary = await awardActivity(input.userId, "review", input.correct);
  return { state: updated, summary };
}
