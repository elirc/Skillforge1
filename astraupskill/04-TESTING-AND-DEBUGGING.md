# Fail after quest and achievement work

The fixture creates one learner, a course hierarchy, a lesson with two knowledge items, a low daily XP goal, and a seeded achievement. A fixed timestamp makes review due dates predictable. Successful completion must produce one lesson contribution, one quest reward, one achievement reward, and one earned-achievement row, with two review states due at the captured time.

The late-failure case throws from beforeCommit after awardActivity has run. It then checks that completion, review, XP, quest, and earned-achievement rows are absent and progress remains zero. These are real SQLite queries after a rejected transaction, not assertions against mocked method call counts.

The concurrency case starts two completions together and requires one newlyCompleted result and one duplicate result. It then repeats completion sequentially and checks that the result is still duplicate. Durable counts remain one contribution per reward kind, with unchanged quest progress and review seeds.

Eligibility cases cover both an empty lesson and a missing identifier. When debugging a failure, first confirm the owned database guard enabled the suite. Then inspect whether the failure concerns eligibility, uniqueness, client propagation, or a contention error outside the retry classification. Do not weaken durable-state assertions merely because the service returned the expected boolean.

## Source excerpt

From [tests/unit/completion.test.ts](../tests/unit/completion.test.ts).

```ts
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
```

## Course navigation

[README](README.md) / [01-CODEBASE-MAP](01-CODEBASE-MAP.md) / [02-CONCEPTS](02-CONCEPTS.md) / [03-WORKED-CHANGE](03-WORKED-CHANGE.md) / [04-TESTING-AND-DEBUGGING](04-TESTING-AND-DEBUGGING.md) / [05-PRACTICE](05-PRACTICE.md) / [06-SOLUTIONS-AND-REVIEW](06-SOLUTIONS-AND-REVIEW.md) / [07-TRACE-LAB](07-TRACE-LAB.md) / [VERIFICATION](VERIFICATION.md)
