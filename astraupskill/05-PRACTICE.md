# Predict the ledger before running the test

Exercise one: submit completion for a valid lesson twice concurrently, then once after both requests finish. Predict newlyCompleted for all three results, the number of LessonCompletion rows, review-state count, and lesson XP events. Explain which database constraint chooses the winner.

Exercise two: throw after quest and achievement rewards have been calculated but before commit. List every table whose new rows must disappear. Explain why asserting only that LessonCompletion is absent would miss a helper that accidentally used the global Prisma client.

Exercise three: pass an empty lesson and then an unknown identifier. Identify where rejection occurs and which writes must not happen. Compare that failure with a duplicate completion for an eligible lesson: they have different meanings and should not share a broad catch-all success path.

Exercise four: inject a P2002 error for an unrelated unique key. Predict whether it should return newlyCompleted false. Inspect the model and target checks before answering. Then inject a recognized busy error twice and success on the third attempt; count transactions and describe which timestamp each attempt uses.

Exercise five: run the ordinary unit command without the ownership marker. Explain why skipped completion tests are the correct result and why that command alone cannot substantiate the transaction claims in this course.

## Source excerpt

From [tests/unit/completion.test.ts](../tests/unit/completion.test.ts).

```ts
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
