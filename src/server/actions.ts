"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/user";
import { awardActivity } from "@/server/gamification";
import { gradeReviewItem, recallScoreSchema, seedLessonReviewStates } from "@/server/review";

const completeLessonSchema = z.object({
  lessonId: z.string(),
});

export async function completeLessonAction(input: z.infer<typeof completeLessonSchema>) {
  const { lessonId } = completeLessonSchema.parse(input);
  const user = await getCurrentUser();

  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {},
    create: { userId: user.id, lessonId },
  });
  await seedLessonReviewStates(user.id, lessonId);
  await awardActivity(user.id, "lesson");

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/profile");
  return { ok: true };
}

const gradeReviewSchema = z.object({
  reviewStateId: z.string(),
  response: z.unknown(),
  correct: z.boolean(),
  recallScore: recallScoreSchema,
  durationMs: z.number().int().min(0).max(600_000),
});

export async function gradeReviewAction(input: z.infer<typeof gradeReviewSchema>) {
  const parsed = gradeReviewSchema.parse(input);
  const user = await getCurrentUser();
  await gradeReviewItem({ ...parsed, userId: user.id });

  revalidatePath("/reviews");
  revalidatePath("/profile");
  return { ok: true };
}
