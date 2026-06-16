import { prisma } from "@/lib/prisma";
import { achievementKeysForProgress, applyActivityProgress, type ActivityKind } from "@/lib/gamification";

export async function awardActivity(userId: string, kind: ActivityKind, correct = true, now = new Date()) {
  const progress = await prisma.progress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const next = applyActivityProgress(progress, kind, now, correct);
  const saved = await prisma.progress.update({
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

  await syncLeaderboard(userId, saved.xp);
  await unlockAvailableAchievements(userId);
  return saved;
}

async function syncLeaderboard(userId: string, xp: number) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const league = await prisma.league.upsert({
    where: { id: "weekly-bronze" },
    update: { startsAt: weekStart, endsAt: weekEnd },
    create: { id: "weekly-bronze", name: "Bronze Forge", startsAt: weekStart, endsAt: weekEnd },
  });

  await prisma.leaderboardEntry.upsert({
    where: { leagueId_userId: { leagueId: league.id, userId } },
    update: { xp },
    create: { leagueId: league.id, userId, xp, optedIn: true },
  });
}

export async function unlockAvailableAchievements(userId: string) {
  const [progress, reviewStateCount, completedLessons] = await Promise.all([
    prisma.progress.findUniqueOrThrow({ where: { userId } }),
    prisma.reviewState.count({ where: { userId, reps: { gte: 1 } } }),
    prisma.lessonCompletion.count({ where: { userId } }),
  ]);

  const keys = achievementKeysForProgress(progress, reviewStateCount, completedLessons);
  const achievements = await prisma.achievement.findMany({ where: { key: { in: keys } } });

  await Promise.all(
    achievements.map((achievement) =>
      prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
        update: {},
        create: { userId, achievementId: achievement.id },
      }),
    ),
  );
}
