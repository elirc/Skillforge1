import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dayKey, questsForDay, type ActivityKind, type QuestTemplate } from "@/lib/gamification";
import { experienceSchema, goalSchema } from "@/lib/enums";

type DbClient = Prisma.TransactionClient | PrismaClient;

export interface QuestView {
  id: string;
  key: string;
  title: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
}

async function templatesFor(userId: string, client: DbClient): Promise<QuestTemplate[]> {
  const user = await client.user.findUniqueOrThrow({
    where: { id: userId },
    include: { progress: true },
  });
  return questsForDay(
    goalSchema.catch("crud-dev").parse(user.goal),
    experienceSchema.catch("beginner").parse(user.experience),
    user.progress?.dailyXpGoal ?? 60,
  );
}

/**
 * Rolls today's quest board. Idempotent: called on every dashboard load and on
 * every XP award, so the board appears the moment the local day flips.
 */
export async function ensureTodaysQuests(
  userId: string,
  now = new Date(),
  client: DbClient = prisma,
): Promise<QuestView[]> {
  const day = dayKey(now);
  const templates = await templatesFor(userId, client);

  for (const template of templates) {
    await client.quest.upsert({
      where: { userId_day_key: { userId, day, key: template.key } },
      update: { title: template.title, target: template.target, xpReward: template.xpReward },
      create: {
        userId,
        day,
        key: template.key,
        title: template.title,
        target: template.target,
        xpReward: template.xpReward,
      },
    });
  }

  // Quests from other days are history we do not need; keep the table small.
  await client.quest.deleteMany({ where: { userId, day: { lt: dayKey(new Date(now.getTime() - 30 * 86_400_000)) } } });

  return listTodaysQuests(userId, now, client);
}

export async function listTodaysQuests(
  userId: string,
  now = new Date(),
  client: DbClient = prisma,
): Promise<QuestView[]> {
  const quests = await client.quest.findMany({
    where: { userId, day: dayKey(now) },
    orderBy: { key: "asc" },
  });

  return quests.map((quest) => ({
    id: quest.id,
    key: quest.key,
    title: quest.title,
    target: quest.target,
    progress: quest.progress,
    xpReward: quest.xpReward,
    completed: quest.completedAt !== null,
  }));
}

export interface QuestCompletion {
  key: string;
  title: string;
  xpReward: number;
}

/** Total XP recorded today, bonuses included — the same number the daily ring shows. */
async function xpRecordedToday(userId: string, day: string, client: DbClient) {
  const result = await client.xpEvent.aggregate({ where: { userId, day }, _sum: { amount: true } });
  return result._sum.amount ?? 0;
}

/**
 * Advances every quest that tracks this activity. Returns the ones that just
 * flipped to complete so the caller can pay out the bonus and toast it.
 *
 * Activity quests increment by one; the daily-XP quest is set absolutely from
 * the XP ledger so it never drifts from the ring in the header.
 */
export async function advanceQuests(
  userId: string,
  kind: ActivityKind,
  now = new Date(),
  client: DbClient = prisma,
  onlyXp = false,
): Promise<QuestCompletion[]> {
  const day = dayKey(now);
  const templates = await templatesFor(userId, client);
  const completions: QuestCompletion[] = [];
  const dailyXp = templates.some((template) => template.tracks === "xp")
    ? await xpRecordedToday(userId, day, client)
    : 0;

  for (const template of templates) {
    if (onlyXp && template.tracks !== "xp") continue;
    const tracksThis = template.tracks === "xp" || template.tracks === kind;
    if (!tracksThis) continue;

    const quest = await client.quest.findUnique({
      where: { userId_day_key: { userId, day, key: template.key } },
    });
    if (!quest || quest.completedAt) continue;

    const progress =
      template.tracks === "xp"
        ? Math.min(quest.target, dailyXp)
        : Math.min(quest.target, quest.progress + 1);
    const justCompleted = progress >= quest.target;

    await client.quest.update({
      where: { id: quest.id },
      data: { progress, completedAt: justCompleted ? now : null },
    });

    if (justCompleted) {
      completions.push({ key: quest.key, title: quest.title, xpReward: quest.xpReward });
    }
  }

  return completions;
}
