"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { experienceSchema, goalSchema } from "@/lib/enums";
import { getCurrentUser, updateProfile } from "@/server/user";
import type { AwardSummary } from "@/server/gamification";
import { gradeReviewItem, recallScoreSchema } from "@/server/review";
import { completeLessonForUser } from "@/server/completion";
import { durationMsSchema } from "@/lib/activity-duration";

function revalidateProgressSurfaces() {
  revalidatePath("/");
  revalidatePath("/tracks");
  revalidatePath("/reviews");
  revalidatePath("/profile");
  revalidatePath("/mastery");
  revalidatePath("/problems");
}

const completeLessonSchema = z.object({
  lessonId: z.string(),
  assisted: z.boolean().optional(),
});

export async function completeLessonAction(input: z.infer<typeof completeLessonSchema>): Promise<AwardSummary> {
  const { lessonId, assisted } = completeLessonSchema.parse(input);
  const user = await getCurrentUser();

  const { summary } = await completeLessonForUser(user.id, lessonId, { assisted });

  revalidateProgressSurfaces();
  return summary;
}

const gradeReviewSchema = z.object({
  reviewStateId: z.string(),
  response: z.unknown(),
  /**
   * Accepted for backward compatibility with older clients but never used:
   * the server derives correctness from the stored knowledge item.
   */
  correct: z.boolean().optional(),
  recallScore: recallScoreSchema,
  durationMs: durationMsSchema,
});

export type GradeReviewActionResult = AwardSummary & { correct: boolean; expected: string };

export async function gradeReviewAction(
  input: z.infer<typeof gradeReviewSchema>,
): Promise<GradeReviewActionResult> {
  const { reviewStateId, response, recallScore, durationMs } = gradeReviewSchema.parse(input);
  const user = await getCurrentUser();
  const { summary, correct, expected } = await gradeReviewItem({
    userId: user.id,
    reviewStateId,
    response,
    recallScore,
    durationMs,
  });

  revalidateProgressSurfaces();
  return { ...summary, correct, expected };
}

const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(40),
  goal: goalSchema,
  experience: experienceSchema,
  dailyXpGoal: z.number().int().min(20).max(500),
  dailyMinutes: z.number().int().min(5).max(120).optional(),
  focusTags: z.array(z.string()).max(12).default([]),
});

export async function saveOnboardingAction(input: z.infer<typeof onboardingSchema>) {
  const parsed = onboardingSchema.parse(input);
  await updateProfile({ ...parsed, markOnboarded: true });
  revalidateProgressSurfaces();
  redirect("/");
}

const settingsSchema = onboardingSchema.partial();

export async function saveSettingsAction(input: z.infer<typeof settingsSchema>) {
  const parsed = settingsSchema.parse(input);
  await updateProfile(parsed);
  revalidateProgressSurfaces();
  return { ok: true };
}

/** Wipes all learner progress but keeps the seeded course content. */
export async function resetProgressAction() {
  const user = await getCurrentUser();
  await prisma.$transaction([
    prisma.attempt.deleteMany({ where: { userId: user.id } }),
    prisma.reviewState.deleteMany({ where: { userId: user.id } }),
    prisma.lessonCompletion.deleteMany({ where: { userId: user.id } }),
    prisma.problemSubmission.deleteMany({ where: { userId: user.id } }),
    prisma.userAchievement.deleteMany({ where: { userId: user.id } }),
    prisma.xpEvent.deleteMany({ where: { userId: user.id } }),
    prisma.quest.deleteMany({ where: { userId: user.id } }),
    prisma.progress.updateMany({
      where: { userId: user.id },
      data: { xp: 0, level: 1, streakCurrent: 0, streakLongest: 0, streakFreezes: 2, lastActiveDate: null },
    }),
  ]);
  revalidateProgressSurfaces();
  return { ok: true };
}
