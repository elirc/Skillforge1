import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { gradeReviewItem as gradeReview, type GradeReviewInput, type GradeReviewOptions } from "@/server/review";
import path from "node:path";
import { tmpdir } from "node:os";

// Same ownership marker as completion.test.ts: only runs against the temp
// database created by scripts/test-completion-local.mjs, never the real one.
const ownedPath = process.env.SKILLFORGE_COMPLETION_TEST_DB;
const ownedDatabase = !!ownedPath &&
  process.env.DATABASE_URL === `file:${ownedPath}` &&
  path.dirname(path.dirname(path.resolve(ownedPath))) === path.resolve(tmpdir()) &&
  path.basename(path.dirname(ownedPath)).startsWith("skillforge-completion-");

const userId = "review-user";
const reviewStateId = "review-state-mcq";
const now = new Date("2026-09-19T12:34:56.789Z");
const seededDueAt = new Date("2026-09-18T08:00:00.000Z");
const prisma = new PrismaClient({ transactionOptions: { maxWait: 60000, timeout: 60000 } });
const gradeReviewItem = (input: Omit<GradeReviewInput, "userId">, options: GradeReviewOptions = {}) =>
  gradeReview({ userId, ...input }, { now, ...options, client: prisma });

async function seedFixture() {
  await prisma.user.create({
    data: {
      id: userId,
      name: "Review Learner",
      goal: "crud-dev",
      experience: "beginner",
      progress: { create: { dailyXpGoal: 1 } },
    },
  });
  await prisma.course.create({
    data: {
      id: "review-course",
      slug: "review-course",
      title: "Review Course",
      description: "Fixture course",
      language: "TypeScript",
      difficulty: "BEGINNER",
      order: 1,
      modules: {
        create: {
          id: "review-module",
          title: "Honest grading",
          order: 1,
          lessons: {
            create: {
              id: "review-lesson",
              title: "Server verdicts",
              order: 1,
              contentBlocks: [],
              knowledgeItems: {
                create: {
                  id: "review-item-mcq",
                  order: 1,
                  type: "MCQ",
                  prompt: "Which keyword declares a block-scoped constant?",
                  payload: { choices: ["var", "let", "const"], answer: "const", explanation: "const" },
                  conceptTags: JSON.stringify(["variables"]),
                },
              },
            },
          },
        },
      },
    },
  });
  await prisma.reviewState.create({
    data: {
      id: reviewStateId,
      userId,
      knowledgeItemId: "review-item-mcq",
      dueAt: seededDueAt,
      state: "NEW",
    },
  });
}

describe.skipIf(!ownedDatabase)("server-derived, atomic review grading (helper-owned database)", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    await prisma.achievement.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("ignores a client claiming correct on a wrong answer and pays no full XP", async () => {
    await seedFixture();

    const result = await gradeReviewItem({
      reviewStateId,
      response: { answer: "let" },
      // An old or tampered client still sends this; the server must ignore it.
      ...({ correct: true } as object),
      recallScore: "good",
      durationMs: 1200,
    });

    expect(result.correct).toBe(false);
    expect(result.expected).toBe("const");
    expect(result.summary.xpEarned).toBe(2);
    const attempt = await prisma.attempt.findFirstOrThrow({ where: { userId } });
    expect(attempt.correct).toBe(false);
    expect(attempt.recallScore).toBe("AGAIN");
    expect(result.state.lapses).toBeGreaterThan(0);
    expect(result.state.dueAt.getTime() - now.getTime()).toBeLessThan(60 * 60_000);
    const reviewXp = await prisma.xpEvent.findMany({ where: { userId, kind: "review" } });
    expect(reviewXp.map((event) => event.amount)).toEqual([2]);
    // Total XP is the 2 XP miss plus any daily-quest bonus; never the full 8 review XP.
    expect((await prisma.progress.findUniqueOrThrow({ where: { userId } })).xp).toBe(2 + result.summary.bonusXp);
  });

  it("pays full XP for a right answer and treats again as incorrect regardless", async () => {
    await seedFixture();

    const right = await gradeReviewItem({
      reviewStateId, response: { answer: " const " }, recallScore: "good", durationMs: 900,
    });
    expect(right.correct).toBe(true);
    expect(right.summary.xpEarned).toBe(8);

    const again = await gradeReviewItem({
      reviewStateId, response: { answer: "const" }, recallScore: "again", durationMs: 900,
    });
    expect(again.correct).toBe(false);
    expect(
      (await prisma.attempt.findMany({ where: { userId }, orderBy: { durationMs: "asc" } })).map((a) => a.correct).sort(),
    ).toEqual([false, true]);
  });

  it("rolls back the reschedule, attempt, and award when a late step fails", async () => {
    await seedFixture();

    await expect(
      gradeReviewItem(
        { reviewStateId, response: { answer: "const" }, recallScore: "easy", durationMs: 500 },
        {
          beforeCommit: () => {
            throw new Error("injected late failure");
          },
        },
      ),
    ).rejects.toThrow("injected late failure");

    const state = await prisma.reviewState.findUniqueOrThrow({ where: { id: reviewStateId } });
    expect(state).toMatchObject({ reps: 0, lapses: 0, state: "NEW", lastReviewedAt: null });
    expect(state.dueAt.toISOString()).toBe(seededDueAt.toISOString());
    expect(await prisma.attempt.count()).toBe(0);
    expect(await prisma.xpEvent.count()).toBe(0);
    expect(await prisma.quest.count()).toBe(0);
    expect((await prisma.progress.findUniqueOrThrow({ where: { userId } })).xp).toBe(0);
  });

  it("refuses to grade another learner's review state", async () => {
    await seedFixture();

    await expect(
      gradeReview(
        { userId: "someone-else", reviewStateId, response: { answer: "const" }, recallScore: "good", durationMs: 1 },
        { now, client: prisma },
      ),
    ).rejects.toThrow();
    expect(await prisma.attempt.count()).toBe(0);
  });
});
