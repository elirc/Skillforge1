import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { tmpdir } from "node:os";
import { exportProgress, importProgress } from "@/server/backup";
import { parseBackup } from "@/lib/backup";
import { getConceptMastery, getWeakConcepts } from "@/server/mastery";

// Only runs inside scripts/test-backup-local.mjs, which owns a throwaway
// SQLite file under the OS temp dir. It never touches data/skillforge.db.
const ownedPath = process.env.SKILLFORGE_BACKUP_TEST_DB;
const ownedDatabase =
  !!ownedPath &&
  process.env.DATABASE_URL === `file:${ownedPath}` &&
  path.dirname(path.dirname(path.resolve(ownedPath))) === path.resolve(tmpdir()) &&
  path.basename(path.dirname(ownedPath)).startsWith("skillforge-backup-");

const userId = "backup-user";
const at = new Date("2026-09-20T10:00:00.000Z");
const prisma = new PrismaClient({ transactionOptions: { maxWait: 60000, timeout: 60000 } });

/** Content with ids that change per "seed", but the same slugs and positions. */
async function seedContent(generation: string, { dropSecondLesson = false } = {}) {
  await prisma.course.create({
    data: {
      id: `course-${generation}`,
      slug: "backup-course",
      title: "Backup Course",
      description: "Fixture",
      language: "javascript",
      difficulty: "BEGINNER",
      order: 1,
      modules: {
        create: {
          id: `module-${generation}`,
          title: "Module",
          order: 1,
          lessons: {
            create: [1, 2]
              .filter((order) => !(dropSecondLesson && order === 2))
              .map((order) => ({
                id: `lesson-${order}-${generation}`,
                title: `Lesson ${order}`,
                order,
                contentBlocks: [],
                knowledgeItems: {
                  create: [1, 2].map((item) => ({
                    id: `item-${order}-${item}-${generation}`,
                    order: item,
                    type: "MCQ",
                    prompt: `Q${order}.${item}`,
                    payload: {},
                    conceptTags: JSON.stringify(["fixtures"]),
                  })),
                },
              })),
          },
        },
      },
    },
  });
  await prisma.problem.create({
    data: {
      id: `problem-${generation}`,
      slug: "backup-problem",
      title: "Backup Problem",
      prompt: "p",
      explanation: {},
      difficulty: "HARD",
      starterCode: "",
      functionName: "f",
      tests: [],
      referenceSolution: "",
    },
  });
  await prisma.achievement.create({
    data: { id: `ach-${generation}`, key: "first-forge", name: "First Forge", description: "d", icon: "x", xpReward: 10 },
  });
}

async function seedLearner(generation: string) {
  await prisma.user.create({
    data: {
      id: userId,
      name: "Backup Learner",
      goal: "interview",
      experience: "junior",
      focusTags: JSON.stringify(["sql"]),
      onboardedAt: at,
      progress: { create: { xp: 420, level: 3, streakCurrent: 5, streakLongest: 7, lastActiveDate: at, streakFreezes: 1, dailyXpGoal: 90 } },
    },
  });
  await prisma.lessonCompletion.createMany({
    data: [1, 2].map((order) => ({ userId, lessonId: `lesson-${order}-${generation}`, createdAt: at })),
  });
  await prisma.reviewState.createMany({
    data: [
      { userId, knowledgeItemId: `item-1-2-${generation}`, dueAt: at, stability: 4, difficulty: 4, interval: 4, reps: 3, lastReviewedAt: at, state: "REVIEW" },
      { userId, knowledgeItemId: `item-2-1-${generation}`, dueAt: at, reps: 1, state: "LEARNING" },
    ],
  });
  await prisma.attempt.create({
    data: { userId, knowledgeItemId: `item-1-2-${generation}`, response: { choice: "a" }, correct: true, recallScore: "GOOD", durationMs: 900 },
  });
  await prisma.problemSubmission.create({
    data: { userId, problemId: `problem-${generation}`, code: "return 42;", passed: true, durationMs: 12 },
  });
  await prisma.userAchievement.create({ data: { userId, achievementId: `ach-${generation}`, earnedAt: at } });
  await prisma.xpEvent.createMany({
    data: [
      { userId, kind: "lesson", amount: 35, day: "2026-09-20" },
      { userId, kind: "achievement", amount: 10, day: "2026-09-20", detail: "first-forge" },
    ],
  });
  await prisma.quest.create({
    data: { userId, day: "2026-09-20", key: "daily-xp", title: "Earn 90 XP", target: 90, progress: 45, xpReward: 20 },
  });
}

async function wipe() {
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.achievement.deleteMany();
}

describe.skipIf(!ownedDatabase)("progress export/import (helper-owned database)", () => {
  beforeEach(wipe);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("survives a re-seed that gives every content row a new id", async () => {
    await seedContent("v1");
    await seedLearner("v1");
    const backup = await exportProgress(userId, { client: prisma, now: at });
    const text = JSON.stringify(backup);
    expect(text).not.toContain("-v1");

    // Simulate db:reset + db:seed: content comes back under new cuids.
    await wipe();
    await seedContent("v2");
    await prisma.user.create({ data: { id: userId, progress: { create: {} } } });

    const parsed = parseBackup(JSON.parse(text));
    if (!parsed.ok) throw new Error(parsed.error);
    const report = await importProgress(userId, parsed.backup, { client: prisma });

    expect(report.skippedTotal).toBe(0);
    expect(report.imported).toMatchObject({ lessonCompletions: 2, reviewStates: 2, attempts: 1, problemSubmissions: 1, achievements: 1, xpEvents: 2, quests: 1 });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { progress: true } });
    expect(user).toMatchObject({ name: "Backup Learner", goal: "interview", experience: "junior", focusTags: '["sql"]' });
    expect(user.progress).toMatchObject({ xp: 420, streakCurrent: 5, streakLongest: 7, streakFreezes: 1, dailyXpGoal: 90 });

    const states = await prisma.reviewState.findMany({ where: { userId }, orderBy: { knowledgeItemId: "asc" } });
    expect(states.map((state) => state.knowledgeItemId)).toEqual(["item-1-2-v2", "item-2-1-v2"]);
    expect(states[0]).toMatchObject({ reps: 3, stability: 4, state: "REVIEW" });
    expect(await prisma.attempt.findFirstOrThrow({ where: { userId } })).toMatchObject({ knowledgeItemId: "item-1-2-v2", response: { choice: "a" } });
    expect(await prisma.userAchievement.findFirstOrThrow({ where: { userId } })).toMatchObject({ achievementId: "ach-v2" });
    expect(await prisma.problemSubmission.findFirstOrThrow({ where: { userId } })).toMatchObject({ problemId: "problem-v2" });

    // Exporting again produces the same document (apart from the timestamp).
    const again = await exportProgress(userId, { client: prisma, now: at });
    expect(again.reviewStates).toEqual(backup.reviewStates);
    expect(again.lessonCompletions).toEqual(backup.lessonCompletions);
  });

  it("replaces existing progress instead of merging, and reports content that is gone", async () => {
    await seedContent("v1");
    await seedLearner("v1");
    const backup = await exportProgress(userId, { client: prisma, now: at });

    await wipe();
    await seedContent("v2", { dropSecondLesson: true });
    // Pre-existing, different progress that the import must wipe.
    await prisma.user.create({ data: { id: userId, progress: { create: { xp: 9999, level: 12 } } } });
    await prisma.lessonCompletion.create({ data: { userId, lessonId: "lesson-1-v2" } });
    await prisma.xpEvent.createMany({
      data: Array.from({ length: 5 }, () => ({ userId, kind: "review", amount: 8, day: "2026-09-23" })),
    });
    const report = await importProgress(userId, backup, { client: prisma });

    // Lesson 2's completion and its review state have no home any more.
    expect(report.skipped).toMatchObject({ lessonCompletions: 1, reviewStates: 1 });
    expect(report.skippedTotal).toBe(2);
    expect(await prisma.lessonCompletion.count({ where: { userId } })).toBe(1);
    expect(await prisma.reviewState.count({ where: { userId } })).toBe(1);
    // Replaced, not doubled.
    expect(await prisma.xpEvent.count({ where: { userId } })).toBe(2);
    expect((await prisma.progress.findUniqueOrThrow({ where: { userId } })).xp).toBe(420);
  }, 90_000);

  it("rolls back completely when a write inside the import fails", async () => {
    await seedContent("v1");
    await seedLearner("v1");
    const backup = await exportProgress(userId, { client: prisma, now: at });
    // Another row already owns this email, so the profile write violates a unique constraint
    // after every delete has run.
    await prisma.user.create({ data: { id: "someone-else", email: "taken@example.com" } });

    await expect(
      importProgress(userId, { ...backup, profile: { ...backup.profile, email: "taken@example.com" } }, { client: prisma }),
    ).rejects.toThrow();

    expect(await prisma.lessonCompletion.count({ where: { userId } })).toBe(2);
    expect(await prisma.reviewState.count({ where: { userId } })).toBe(2);
    expect(await prisma.xpEvent.count({ where: { userId } })).toBe(2);
    expect(await prisma.userAchievement.count({ where: { userId } })).toBe(1);
  });

  it("derives concept mastery from review states and completed lessons", async () => {
    await seedContent("v1");
    await seedLearner("v1");
    // The fixture uses the module-level client from @/lib/prisma, which points at the same temp file.
    const overview = await getConceptMastery(userId, at);
    expect(overview.courses).toHaveLength(1);
    expect(overview.courses[0].course.slug).toBe("backup-course");
    expect(overview.courses[0].concepts).toEqual([
      expect.objectContaining({ tag: "fixtures", samples: 2, due: 2 }),
    ]);
    // Both review states are due at the fixed time, and each card counts once.
    expect(overview.totals).toMatchObject({ concepts: 1, reviewed: 1, due: 2 });

    const weak = await getWeakConcepts(userId, 5, at);
    expect(weak).toEqual([expect.objectContaining({ tag: "fixtures", course: "Backup Course", samples: 2 })]);
  });
});
