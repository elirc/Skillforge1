import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseTags, serializeTags } from "@/lib/enums";
import { z } from "zod";
import {
  buildContentIndex,
  planImport,
  serializeProgress,
  type ContentIndex,
  type ImportSkipped,
  type ProgressBackup,
} from "@/lib/backup";

type DbClient = Prisma.TransactionClient | PrismaClient;

export async function loadContentIndex(client: DbClient = prisma): Promise<ContentIndex> {
  const [lessons, items, problems, achievements, legacy] = await Promise.all([
    client.lesson.findMany({
      select: { id: true, contentKey: true, order: true, module: { select: { order: true, course: { select: { slug: true } } } } },
    }),
    client.knowledgeItem.findMany({ select: { id: true, contentKey: true, order: true, lessonId: true } }),
    client.problem.findMany({ select: { id: true, slug: true } }),
    client.achievement.findMany({ select: { id: true, key: true } }),
    client.appMetadata.findUnique({ where: { key: "backup-legacy-positions" } }),
  ]);
  const index = buildContentIndex({ lessons, items, problems, achievements });
  if (legacy) {
    const aliases = z.object({ lessons: z.record(z.string(), z.string()), items: z.record(z.string(), z.string()) }).parse(JSON.parse(legacy.value));
    for (const [key, id] of Object.entries(aliases.lessons)) if (index.lessonKeyById.has(id)) index.lessonIdByKey.set(key, id);
    for (const [key, id] of Object.entries(aliases.items)) if (index.itemKeyById.has(id)) index.itemIdByKey.set(key, id);
  }
  return index;
}

/** Every learner-owned row for `userId`, as a portable backup document. */
export async function exportProgress(
  userId: string,
  { client = prisma, now = new Date() }: { client?: DbClient; now?: Date } = {},
): Promise<ProgressBackup> {
  const where = { userId };
  const [index, user, progress, lessonCompletions, reviewStates, attempts, problemSubmissions, achievements, xpEvents, quests] =
    await Promise.all([
      loadContentIndex(client),
      client.user.findUniqueOrThrow({ where: { id: userId } }),
      client.progress.findUnique({ where }),
      client.lessonCompletion.findMany({ where, orderBy: { createdAt: "asc" } }),
      client.reviewState.findMany({ where, orderBy: { createdAt: "asc" } }),
      client.attempt.findMany({ where, orderBy: { createdAt: "asc" } }),
      client.problemSubmission.findMany({ where, orderBy: { createdAt: "asc" } }),
      client.userAchievement.findMany({ where, orderBy: { earnedAt: "asc" } }),
      client.xpEvent.findMany({ where, orderBy: { createdAt: "asc" } }),
      client.quest.findMany({ where, orderBy: [{ day: "asc" }, { key: "asc" }] }),
    ]);

  const backup = serializeProgress(
    {
      user: { ...user, focusTags: parseTags(user.focusTags) },
      progress,
      lessonCompletions,
      reviewStates,
      attempts,
      problemSubmissions,
      achievements,
      xpEvents,
      quests,
    },
    index,
    now,
  );
  const version = await client.appMetadata.findUnique({ where: { key: "content-version" } });
  return { ...backup, contentVersion: version?.value ?? "legacy" };
}

export interface ImportReport {
  imported: {
    lessonCompletions: number;
    reviewStates: number;
    attempts: number;
    problemSubmissions: number;
    achievements: number;
    xpEvents: number;
    quests: number;
  };
  skipped: ImportSkipped;
  skippedTotal: number;
  xp: number;
  level: number;
}

function toJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value === null || value === undefined ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

/**
 * Replaces all of `userId`'s progress with the backup's, inside one
 * transaction: either the learner ends up exactly at the backup, or nothing
 * changes. Content rows are never touched.
 */
export async function importProgress(
  userId: string,
  backup: ProgressBackup,
  { client = prisma }: { client?: PrismaClient } = {},
): Promise<ImportReport> {
  return client.$transaction(
    async (tx) => {
      const plan = planImport(backup, await loadContentIndex(tx));
      const where = { userId };

      await tx.attempt.deleteMany({ where });
      await tx.reviewState.deleteMany({ where });
      await tx.lessonCompletion.deleteMany({ where });
      await tx.problemSubmission.deleteMany({ where });
      await tx.userAchievement.deleteMany({ where });
      await tx.xpEvent.deleteMany({ where });
      await tx.quest.deleteMany({ where });

      const profile = { ...plan.profile, focusTags: serializeTags(plan.profile.focusTags) };
      await tx.user.upsert({ where: { id: userId }, update: profile, create: { id: userId, ...profile } });
      await tx.progress.upsert({ where, update: plan.progress, create: { userId, ...plan.progress } });

      const withUser = <T extends object>(rows: T[]) => rows.map((row) => ({ ...row, userId }));

      if (plan.lessonCompletions.length) await tx.lessonCompletion.createMany({ data: withUser(plan.lessonCompletions) });
      if (plan.reviewStates.length) await tx.reviewState.createMany({ data: withUser(plan.reviewStates) });
      if (plan.attempts.length) {
        await tx.attempt.createMany({
          data: plan.attempts.map((row) => ({ ...row, userId, response: toJson(row.response) })),
        });
      }
      if (plan.problemSubmissions.length) await tx.problemSubmission.createMany({ data: withUser(plan.problemSubmissions) });
      if (plan.achievements.length) await tx.userAchievement.createMany({ data: withUser(plan.achievements) });
      if (plan.xpEvents.length) await tx.xpEvent.createMany({ data: withUser(plan.xpEvents) });
      if (plan.quests.length) await tx.quest.createMany({ data: withUser(plan.quests) });

      return {
        imported: {
          lessonCompletions: plan.lessonCompletions.length,
          reviewStates: plan.reviewStates.length,
          attempts: plan.attempts.length,
          problemSubmissions: plan.problemSubmissions.length,
          achievements: plan.achievements.length,
          xpEvents: plan.xpEvents.length,
          quests: plan.quests.length,
        },
        skipped: plan.skipped,
        skippedTotal: plan.skippedTotal,
        xp: plan.progress.xp,
        level: plan.progress.level,
      };
    },
    // A long history is a few thousand rows; SQLite needs more than the 5s default on a slow disk.
    { maxWait: 10_000, timeout: 60_000 },
  );
}
