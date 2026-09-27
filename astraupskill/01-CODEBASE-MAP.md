# Follow the authenticated action through nested awards

The lesson action resolves the current user, calls completeLessonForUser, and revalidates the affected views. The service owns the transaction rather than leaving the action to coordinate several independent writes. CompletionOptions supports an injected client and clock for tests and a late beforeCommit failure seam used to verify rollback.

The service reads the lesson's knowledge-item count before inserting LessonCompletion. Empty and unknown lessons are rejected. The completion table's unique learner-and-lesson key decides whether this is a new contribution. seedLessonReviewStates and awardActivity receive the transaction client, so review rows and gamification changes participate in the same commit.

Nested quest and achievement helpers must keep passing that client. Returning to the module-level Prisma singleton in one nested branch would escape the transaction and undermine rollback even if the outer function appeared correct. The fixture deliberately reaches quest and achievement rewards so those branches are exercised.

The local helper creates a uniquely named temporary directory, points Prisma at its SQLite file, applies the schema, and runs only the guarded completion suite. The tests check the ownership marker and path before enabling database cleanup hooks. Ordinary test runs skip these cases; passing an unrelated unit suite therefore cannot be reported as completion transaction coverage.

## Source excerpt

From [tests/unit/completion.test.ts](../tests/unit/completion.test.ts).

```ts
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
```

## Course navigation

[README](README.md) / [01-CODEBASE-MAP](01-CODEBASE-MAP.md) / [02-CONCEPTS](02-CONCEPTS.md) / [03-WORKED-CHANGE](03-WORKED-CHANGE.md) / [04-TESTING-AND-DEBUGGING](04-TESTING-AND-DEBUGGING.md) / [05-PRACTICE](05-PRACTICE.md) / [06-SOLUTIONS-AND-REVIEW](06-SOLUTIONS-AND-REVIEW.md) / [07-TRACE-LAB](07-TRACE-LAB.md) / [VERIFICATION](VERIFICATION.md)
