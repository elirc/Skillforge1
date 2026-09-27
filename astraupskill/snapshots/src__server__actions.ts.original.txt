"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { experienceSchema, goalSchema } from "@/lib/enums";
import { getCurrentUser, updateProfile } from "@/server/user";
import { awardActivity, noAwardSummary, type AwardSummary } from "@/server/gamification";
import { gradeReviewItem, recallScoreSchema, seedLessonReviewStates } from "@/server/review";

function revalidateProgressSurfaces() {
  revalidatePath("/");
  revalidatePath("/tracks");
  revalidatePath("/reviews");
  revalidatePath("/profile");
}

const completeLessonSchema = z.object({
  lessonId: z.string(),
});

export async function completeLessonAction(input: z.infer<typeof completeLessonSchema>): Promise<AwardSummary> {
  const { lessonId } = completeLessonSchema.parse(input);
  const user = await getCurrentUser();

  const existing = await prisma.lessonCompletion.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });

  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {},
    create: { userId: user.id, lessonId },
  });
  await seedLessonReviewStates(user.id, lessonId);

  // Re-reading a finished lesson must not farm XP, streak or quest progress,
  // so a repeat never enters the award pipeline at all.
  const summary = existing ? await noAwardSummary(user.id) : await awardActivity(user.id, "lesson");

  revalidateProgressSurfaces();
  return summary;
}

const gradeReviewSchema = z.object({
  reviewStateId: z.string(),
  response: z.unknown(),
  correct: z.boolean(),
  recallScore: recallScoreSchema,
  durationMs: z.number().int().min(0).max(600_000),
});

export async function gradeReviewAction(input: z.infer<typeof gradeReviewSchema>): Promise<AwardSummary> {
  const parsed = gradeReviewSchema.parse(input);
  const user = await getCurrentUser();
  const { summary } = await gradeReviewItem({ ...parsed, userId: user.id });

  revalidateProgressSurfaces();
  return summary;
}

const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(40),
  goal: goalSchema,
  experience: experienceSchema,
  dailyXpGoal: z.number().int().min(20).max(500),
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
