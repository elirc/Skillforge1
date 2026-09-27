import { prisma } from "@/lib/prisma";
import { experienceSchema, goalSchema, parseTags, serializeTags, type Experience, type Goal } from "@/lib/enums";

/**
 * Skillforge runs solo and local: one learner, one row, no sign-in. Everything
 * that used to key off a session keys off this constant instead.
 */
export const LOCAL_USER_ID = "local";

export interface LocalProfile {
  id: string;
  name: string;
  goal: Goal;
  experience: Experience;
  focusTags: string[];
  onboarded: boolean;
  dailyXpGoal: number;
  dailyMinutes: number;
}

/** Creates the learner row and its progress row on first run. */
export async function getCurrentUser(): Promise<LocalProfile> {
  const user = await prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: { id: LOCAL_USER_ID, name: "Learner", progress: { create: {} } },
    include: { progress: true },
  });

  const progress = user.progress ?? (await ensureProgress(user.id));

  return {
    id: user.id,
    name: user.name,
    goal: goalSchema.catch("crud-dev").parse(user.goal),
    experience: experienceSchema.catch("beginner").parse(user.experience),
    focusTags: parseTags(user.focusTags),
    onboarded: user.onboardedAt !== null,
    dailyXpGoal: progress?.dailyXpGoal ?? 60,
    dailyMinutes: user.dailyMinutes,
  };
}

export async function ensureProgress(userId: string) {
  return prisma.progress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export interface ProfileUpdate {
  name?: string;
  goal?: Goal;
  experience?: Experience;
  focusTags?: string[];
  dailyXpGoal?: number;
  dailyMinutes?: number;
  markOnboarded?: boolean;
}

export async function updateProfile(update: ProfileUpdate) {
  const user = await getCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: update.name,
      goal: update.goal,
      experience: update.experience,
      dailyMinutes: update.dailyMinutes,
      focusTags: update.focusTags ? serializeTags(update.focusTags) : undefined,
      onboardedAt: update.markOnboarded ? new Date() : undefined,
    },
  });

  if (update.dailyXpGoal !== undefined) {
    await prisma.progress.update({
      where: { userId: user.id },
      data: { dailyXpGoal: update.dailyXpGoal },
    });
  }
}
