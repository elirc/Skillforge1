import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { completeLessonForUser as completeLesson, type CompletionOptions } from "@/server/completion";
import path from "node:path";
import { tmpdir } from "node:os";

const ownedPath = process.env.SKILLFORGE_COMPLETION_TEST_DB;
const ownedDatabase = !!ownedPath &&
  process.env.DATABASE_URL === `file:${ownedPath}` &&
  path.dirname(path.dirname(path.resolve(ownedPath))) === path.resolve(tmpdir()) &&
  path.basename(path.dirname(ownedPath)).startsWith("skillforge-completion-");

const userId = "completion-user";
const lessonId = "completion-lesson";
const now = new Date("2026-09-19T12:34:56.789Z");
// This fixture verifies atomicity on slow hosts, not a five-second latency budget.
const prisma = new PrismaClient({ transactionOptions: { maxWait: 60000, timeout: 60000 } });
const completeLessonForUser = (user: string, lesson: string, options: CompletionOptions = {}) =>
  completeLesson(user, lesson, { ...options, client: prisma });

async function seedFixture({ knowledgeItems = 2 } = {}) {
  await prisma.user.create({
    data: {
      id: userId,
      name: "Completion Learner",
      goal: "crud-dev",
      experience: "beginner",
      progress: { create: { dailyXpGoal: 1 } },
    },
  });
  await prisma.course.create({
    data: {
      id: "completion-course",
      slug: "completion-course",
      title: "Completion Course",
      description: "Fixture course",
      language: "TypeScript",
      difficulty: "BEGINNER",
      order: 1,
      modules: {
        create: {
          id: "completion-module",
          title: "Reliable state",
          order: 1,
          lessons: {
            create: {
              id: lessonId,
              title: "Atomic completion",
              order: 1,
              contentBlocks: [],
              knowledgeItems: {
                create: Array.from({ length: knowledgeItems }, (_, index) => ({
                  id: `completion-item-${index + 1}`,
                  order: index + 1,
                  type: "MCQ",
                  prompt: `Question ${index + 1}`,
                  payload: {},
                })),
              },
            },
          },
        },
      },
    },
  });
  await prisma.achievement.create({
    data: {
      key: "first-forge", name: "First Forge", description: "Fixture achievement",
      icon: "anvil", tier: "bronze", xpReward: 10,
    },
  });
}

describe.skipIf(!ownedDatabase)("atomic lesson completion (helper-owned database)", () => {

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.achievement.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it.each([
    { label: "empty", target: lessonId, knowledgeItems: 0 },
    { label: "unknown", target: "missing-lesson", knowledgeItems: 2 },
  ])("rejects an $label lesson without progress or review writes", async ({ target, knowledgeItems }) => {
    await seedFixture({ knowledgeItems });

    await expect(
      completeLessonForUser(userId, target, { now }),
    ).rejects.toThrow("Lesson is not eligible for completion");

    expect(await prisma.lessonCompletion.count()).toBe(0);
    expect(await prisma.reviewState.count()).toBe(0);
    expect(await prisma.xpEvent.count()).toBe(0);
    expect((await prisma.progress.findUniqueOrThrow({ where: { userId } })).xp).toBe(0);
  });

  it("commits completion, deterministic review seeds, XP, and quest progress together", async () => {
    await seedFixture();

    const result = await completeLessonForUser(userId, lessonId, { now });

    expect(result.newlyCompleted).toBe(true);
    expect(await prisma.lessonCompletion.count({ where: { userId, lessonId } })).toBe(1);
    const reviews = await prisma.reviewState.findMany({ where: { userId } });
    expect(reviews).toHaveLength(2);
    expect(new Set(reviews.map((review) => review.dueAt.toISOString()))).toEqual(
      new Set([now.toISOString()]),
    );
    expect(await prisma.xpEvent.count({ where: { userId, kind: "lesson" } })).toBe(1);
    expect(await prisma.xpEvent.count({ where: { userId, kind: "quest" } })).toBe(1);
    expect(await prisma.xpEvent.count({ where: { userId, kind: "achievement" } })).toBe(1);
    expect(await prisma.userAchievement.count({ where: { userId } })).toBe(1);
    expect(
      await prisma.quest.findUnique({
        where: { userId_day_key: { userId, day: "2026-09-19", key: "build-something" } },
      }),
    ).toMatchObject({ progress: 1 });
  });

  it("rolls back real completion and award writes when a late step fails", async () => {
    await seedFixture();

    await expect(
      completeLessonForUser(userId, lessonId, {
        now,
        beforeCommit: () => {
          throw new Error("injected late failure");
        },
      }),
    ).rejects.toThrow("injected late failure");

    expect(await prisma.lessonCompletion.count()).toBe(0);
    expect(await prisma.reviewState.count()).toBe(0);
    expect(await prisma.xpEvent.count()).toBe(0);
    expect(await prisma.quest.count()).toBe(0);
    expect(await prisma.userAchievement.count()).toBe(0);
    expect((await prisma.progress.findUniqueOrThrow({ where: { userId } })).xp).toBe(0);
  });

  it("makes concurrent/repeated completion one award decision", async () => {
    await seedFixture();

    const results = await Promise.all([
      completeLessonForUser(userId, lessonId, { now }),
      completeLessonForUser(userId, lessonId, { now }),
    ]);

    expect(results.map((result) => result.newlyCompleted).sort()).toEqual([false, true]);
    expect((await completeLessonForUser(userId, lessonId, { now })).newlyCompleted).toBe(false);
    expect(await prisma.lessonCompletion.count({ where: { userId, lessonId } })).toBe(1);
    expect(await prisma.reviewState.count({ where: { userId } })).toBe(2);
    expect(await prisma.xpEvent.count({ where: { userId, kind: "lesson" } })).toBe(1);
    expect(await prisma.xpEvent.count({ where: { userId, kind: "quest" } })).toBe(1);
    expect(await prisma.xpEvent.count({ where: { userId, kind: "achievement" } })).toBe(1);
    expect(await prisma.userAchievement.count({ where: { userId } })).toBe(1);
    expect(
      await prisma.quest.findUnique({
        where: { userId_day_key: { userId, day: "2026-09-19", key: "build-something" } },
      }),
    ).toMatchObject({ progress: 1 });
  });
});
