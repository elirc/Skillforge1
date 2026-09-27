import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { tmpdir } from "node:os";
import { saveProblemAttempt } from "@/server/submissions";
import { syncContent } from "../../scripts/lib/seed-content";
import { courseSeedSchema, type CourseSeed } from "@/lib/content-schema";
import { loadContentIndex } from "@/server/backup";
const owned = process.env.SKILLFORGE_COMPLETION_TEST_DB;
const safe =
  !!owned &&
  process.env.DATABASE_URL === `file:${owned}` &&
  path.dirname(path.dirname(path.resolve(owned))) === path.resolve(tmpdir()) &&
  path.basename(path.dirname(owned)).startsWith("skillforge-completion-");
const client = new PrismaClient({
  transactionOptions: { maxWait: 60_000, timeout: 60_000 },
});
const now = new Date("2026-09-19T12:00:00Z");
const course = (): CourseSeed =>
  courseSeedSchema.parse({
    slug: "reliable",
    title: "Reliable",
    description: "Fixture",
    language: "javascript",
    difficulty: "BEGINNER",
    order: 1,
    topicTags: [],
    outcomes: [],
    modules: [
      {
        id: "module-key",
        title: "Module",
        order: 1,
        lessons: [1, 2].map((n) => ({
          id: `lesson-key-${n}`,
          title: `Lesson ${n}`,
          order: n,
          contentBlocks: [],
          knowledgeItems: [
            {
              id: `item-key-${n}`,
              type: "MCQ",
              prompt: `Question ${n}`,
              conceptTags: [],
              payload: {
                choices: ["yes", "no"],
                answer: "yes",
                explanation: "Fixture",
              },
            },
          ],
        })),
      },
    ],
  });
describe.skipIf(!safe)("content and rewards in a helper-owned database", () => {
  beforeEach(async () => {
    await client.user.deleteMany();
    await client.course.deleteMany();
    await client.problem.deleteMany();
    await client.achievement.deleteMany();
    await client.appMetadata.deleteMany();
    await client.user.create({
      data: { id: "local", progress: { create: { dailyXpGoal: 30 } } },
    });
  });
  afterAll(() => client.$disconnect());
  it("rolls back a failed first solve, then awards a retry exactly once including bonus XP", async () => {
    const problem = await client.problem.create({
      data: {
        slug: "fixture",
        title: "Fixture",
        prompt: "Fixture",
        difficulty: "EASY",
        explanation: {},
        starterCode: "",
        functionName: "run",
        tests: [],
        referenceSolution: "",
      },
    });
    const input = {
      problemId: problem.id,
      code: "function run(){}",
      passed: true,
      durationMs: 720_000,
    };
    await expect(
      saveProblemAttempt("local", input, {
        client,
        now,
        beforeCommit: () => {
          throw new Error("late award failure");
        },
      }),
    ).rejects.toThrow("late award failure");
    expect(await client.problemSubmission.count()).toBe(0);
    expect(await client.xpEvent.count()).toBe(0);
    const award = await saveProblemAttempt("local", input, { client, now });
    expect(award?.dailyXp).toBe(52); // 12 exercise + 20 hands-on + 20 daily XP.
    const quest = await client.quest.findFirstOrThrow({
      where: { key: "daily-xp" },
    });
    expect(quest.completedAt).not.toBeNull();
    expect(quest.progress).toBe(30);
    expect(
      await saveProblemAttempt("local", input, { client, now }),
    ).toBeNull();
    expect(await client.xpEvent.count({ where: { kind: "exercise" } })).toBe(1);
  });
  it("preserves content row IDs, completion, and review history through reorder and retirement", async () => {
    const original = course();
    await syncContent(client, [original], []);
    const lesson = await client.lesson.findUniqueOrThrow({
      where: { contentKey: "lesson-key-1" },
    });
    const item = await client.knowledgeItem.findUniqueOrThrow({
      where: { contentKey: "item-key-1" },
    });
    await client.lessonCompletion.create({
      data: { userId: "local", lessonId: lesson.id, assisted: true },
    });
    await client.reviewState.create({
      data: { userId: "local", knowledgeItemId: item.id, dueAt: now, reps: 4 },
    });
    const reordered = structuredClone(original);
    reordered.modules[0].lessons.reverse().forEach((row, i) => {
      row.order = i + 1;
      row.title += " renamed";
    });
    await syncContent(client, [reordered], []);
    expect(
      (
        await client.lesson.findUniqueOrThrow({
          where: { contentKey: "lesson-key-1" },
        })
      ).id,
    ).toBe(lesson.id);
    await syncContent(client, [], []);
    expect(
      (await client.lesson.findUniqueOrThrow({ where: { id: lesson.id } }))
        .archived,
    ).toBe(true);
    expect(await client.lessonCompletion.count()).toBe(1);
    expect((await client.reviewState.findFirstOrThrow()).reps).toBe(4);
    await syncContent(client, [reordered], []);
    expect(
      (await client.lesson.findUniqueOrThrow({ where: { id: lesson.id } }))
        .archived,
    ).toBe(false);
  });
  it("rolls back a malformed catalog without partially archiving installed content", async () => {
    await syncContent(client, [course()], []);
    const baseline = await client.lesson.findMany({ orderBy: { id: "asc" } });
    const broken = course();
    broken.modules[0].lessons[1].order = 1;
    await expect(syncContent(client, [broken], [])).rejects.toThrow();
    expect(await client.lesson.findMany({ orderBy: { id: "asc" } })).toEqual(
      baseline,
    );
  });
  it("remembers pre-upgrade positional backup keys after lesson reordering", async () => {
    await syncContent(client, [course()], []);
    await client.appMetadata.delete({
      where: { key: "backup-legacy-positions" },
    });
    const original = await client.lesson.findUniqueOrThrow({
      where: { contentKey: "lesson-key-1" },
    });
    const changed = course();
    changed.modules[0].lessons[0].order = 2;
    changed.modules[0].lessons[1].order = 1;
    await syncContent(client, [changed], []);
    expect(
      (await loadContentIndex(client)).lessonIdByKey.get("reliable/1/1"),
    ).toBe(original.id);
    await syncContent(client, [changed], []);
    expect(
      (await loadContentIndex(client)).lessonIdByKey.get("reliable/1/1"),
    ).toBe(original.id);
  });
});
