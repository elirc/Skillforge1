import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  achievementDefinitions,
  applyActivityProgress,
  dayKey,
  earnedAchievementKeys,
  levelForXp,
  levelInfo,
  rankForLevel,
  type AchievementStats,
  type ActivityKind,
} from "@/lib/gamification";
import { advanceQuests, ensureTodaysQuests, type QuestCompletion } from "@/server/quests";

type DbClient = Prisma.TransactionClient | PrismaClient;

export interface UnlockedAchievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  xpReward: number;
}

/** Everything the UI needs to celebrate a single action. Returned by every action. */
export interface AwardSummary {
  xpEarned: number;
  bonusXp: number;
  totalXp: number;
  level: number;
  rank: string;
  leveledUp: boolean;
  streakCurrent: number;
  freezeUsed: boolean;
  questsCompleted: QuestCompletion[];
  achievements: UnlockedAchievement[];
  dailyXp: number;
  dailyXpGoal: number;
}

async function addBonusXp(
  userId: string,
  amount: number,
  kind: ActivityKind,
  detail: string,
  now: Date,
  client: DbClient,
) {
  if (amount <= 0) return 0;
  const progress = await client.progress.update({
    where: { userId },
    data: { xp: { increment: amount } },
  });
  await client.progress.update({
    where: { userId },
    data: { level: levelForXp(progress.xp) },
  });
  await client.xpEvent.create({
    data: { userId, kind, amount, day: dayKey(now), detail },
  });
  return amount;
}

/**
 * The single write path for progress. Applies XP and streak, records the XP
 * event, advances daily quests, unlocks achievements, and pays out both bonuses.
 */
export async function awardActivity(
  userId: string,
  kind: ActivityKind,
  correct = true,
  now = new Date(),
  client: DbClient = prisma,
): Promise<AwardSummary> {
  const current = await client.progress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const next = applyActivityProgress(current, kind, now, correct);

  await client.progress.update({
    where: { userId },
    data: {
      xp: next.xp,
      level: next.level,
      streakCurrent: next.streakCurrent,
      streakLongest: next.streakLongest,
      streakFreezes: next.streakFreezes,
      lastActiveDate: next.lastActiveDate,
    },
  });

  await client.xpEvent.create({
    data: { userId, kind, amount: next.xpEarned, day: dayKey(now), detail: null },
  });

  await ensureTodaysQuests(userId, now, client);
  const questsCompleted = await advanceQuests(userId, kind, now, client);

  let bonusXp = 0;
  for (const quest of questsCompleted) {
    bonusXp += await addBonusXp(userId, quest.xpReward, "quest", quest.key, now, client);
  }

  const achievements = await unlockAvailableAchievements(userId, client);
  for (const achievement of achievements) {
    bonusXp += await addBonusXp(
      userId,
      achievement.xpReward,
      "achievement",
      achievement.key,
      now,
      client,
    );
  }

  // Bonuses can cross today's goal. Reconcile XP quests without incrementing
  // activity counts a second time. completedAt makes this payout idempotent.
  for (let pass = 0; pass <= achievementDefinitions.length + 1; pass++) {
    const bonusQuests = await advanceQuests(userId, kind, now, client, true);
    for (const quest of bonusQuests) {
      bonusXp += await addBonusXp(userId, quest.xpReward, "quest", quest.key, now, client);
      questsCompleted.push(quest);
    }
    const bonusAchievements = await unlockAvailableAchievements(userId, client);
    for (const achievement of bonusAchievements) {
      bonusXp += await addBonusXp(userId, achievement.xpReward, "achievement", achievement.key, now, client);
      achievements.push(achievement);
    }
    if (!bonusQuests.length && !bonusAchievements.length) break;
  }

  const [finalProgress, dailyXp] = await Promise.all([
    client.progress.findUniqueOrThrow({ where: { userId } }),
    sumXpForDay(userId, now, client),
  ]);

  return {
    xpEarned: next.xpEarned,
    bonusXp,
    totalXp: finalProgress.xp,
    level: finalProgress.level,
    rank: rankForLevel(finalProgress.level),
    leveledUp: finalProgress.level > current.level,
    streakCurrent: finalProgress.streakCurrent,
    freezeUsed: next.freezeUsed,
    questsCompleted,
    achievements,
    dailyXp,
    dailyXpGoal: finalProgress.dailyXpGoal,
  };
}

/**
 * The shape every action returns, for the case where nothing was earned --
 * repeating an activity that has already paid out. It deliberately does not
 * enter the award pipeline, so a repeat cannot move XP, streaks or quests.
 */
export async function noAwardSummary(
  userId: string,
  now = new Date(),
  client: DbClient = prisma,
): Promise<AwardSummary> {
  const [progress, dailyXp] = await Promise.all([
    client.progress.upsert({ where: { userId }, update: {}, create: { userId } }),
    sumXpForDay(userId, now, client),
  ]);

  return {
    xpEarned: 0,
    bonusXp: 0,
    totalXp: progress.xp,
    level: progress.level,
    rank: rankForLevel(progress.level),
    leveledUp: false,
    streakCurrent: progress.streakCurrent,
    freezeUsed: false,
    questsCompleted: [],
    achievements: [],
    dailyXp,
    dailyXpGoal: progress.dailyXpGoal,
  };
}

export async function sumXpForDay(userId: string, now = new Date(), client: DbClient = prisma) {
  const result = await client.xpEvent.aggregate({
    where: { userId, day: dayKey(now) },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function collectAchievementStats(
  userId: string,
  client: DbClient = prisma,
): Promise<AchievementStats> {
  const [progress, reviewReps, completedLessons, solvedProblems, hardProblemsSolved, questsCompleted] =
    await Promise.all([
      client.progress.findUniqueOrThrow({ where: { userId } }),
      client.reviewState.count({ where: { userId, reps: { gte: 1 } } }),
      client.lessonCompletion.count({ where: { userId } }),
      client.problemSubmission
        .findMany({ where: { userId, passed: true }, select: { problemId: true }, distinct: ["problemId"] })
        .then((rows) => rows.length),
      client.problemSubmission
        .findMany({
          where: { userId, passed: true, problem: { difficulty: "HARD" } },
          select: { problemId: true },
          distinct: ["problemId"],
        })
        .then((rows) => rows.length),
      client.quest.count({ where: { userId, completedAt: { not: null } } }),
    ]);

  return {
    xp: progress.xp,
    level: progress.level,
    streakCurrent: progress.streakCurrent,
    reviewReps,
    completedLessons,
    solvedProblems,
    hardProblemsSolved,
    questsCompleted,
  };
}

/** Returns only the achievements unlocked by this call, so the caller can toast them. */
export async function unlockAvailableAchievements(
  userId: string,
  client: DbClient = prisma,
): Promise<UnlockedAchievement[]> {
  const stats = await collectAchievementStats(userId, client);
  const keys = earnedAchievementKeys(stats);
  if (keys.length === 0) return [];

  const [achievements, alreadyEarned] = await Promise.all([
    client.achievement.findMany({ where: { key: { in: keys } } }),
    client.userAchievement.findMany({
      where: { userId, achievement: { key: { in: keys } } },
      select: { achievementId: true },
    }),
  ]);

  const earnedIds = new Set(alreadyEarned.map((entry) => entry.achievementId));
  const fresh = achievements.filter((achievement) => !earnedIds.has(achievement.id));

  // Two awards racing (a double-click, two tabs) can both see an achievement as
  // unearned. The unique constraint settles which one wins; the loser simply
  // has nothing to toast and must not fail the activity that triggered it.
  // SQLite has no `skipDuplicates`, so the conflict is caught per row.
  const won = await Promise.all(
    fresh.map(async (achievement) => {
      try {
        await client.userAchievement.create({ data: { userId, achievementId: achievement.id } });
        return achievement;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
        throw error;
      }
    }),
  );

  return won
    .filter((achievement) => achievement !== null)
    .map((achievement) => ({
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      tier: achievement.tier,
      xpReward: achievement.xpReward,
    }));
}

/** Achievement gallery for the profile page: earned ones plus progress bars on the rest. */
export async function getAchievementBoard(userId: string) {
  const [stats, earned] = await Promise.all([
    collectAchievementStats(userId),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
  ]);

  const earnedByKey = new Map(earned.map((entry) => [entry.achievement.key, entry.earnedAt]));

  return achievementDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    tier: definition.tier,
    xpReward: definition.xpReward,
    earnedAt: earnedByKey.get(definition.key) ?? null,
    ...definition.progress(stats),
  }));
}

/** Daily XP totals for the activity heatmap, oldest first. */
export async function getXpHistory(userId: string, days = 84, now = new Date()) {
  const start = new Date(now.getTime() - (days - 1) * 86_400_000);
  const events = await prisma.xpEvent.groupBy({
    by: ["day"],
    where: { userId, day: { gte: dayKey(start) } },
    _sum: { amount: true },
  });

  const byDay = new Map(events.map((event) => [event.day, event._sum.amount ?? 0]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start.getTime() + index * 86_400_000);
    const key = dayKey(date);
    return { day: key, date, xp: byDay.get(key) ?? 0 };
  });
}

export async function getProgressOverview(userId: string, now = new Date()) {
  const [progress, dailyXp] = await Promise.all([
    prisma.progress.upsert({ where: { userId }, update: {}, create: { userId } }),
    sumXpForDay(userId, now),
  ]);

  return {
    ...progress,
    ...levelInfo(progress.xp),
    dailyXp,
  };
}
