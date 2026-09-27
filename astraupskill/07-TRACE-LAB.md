# Trace a failed award and a later retry

Begin with the fixture learner at zero XP and an eligible lesson containing two knowledge items. Enter the transaction and record the new completion row. Follow review seeding and note that both due times equal the captured now. Continue through the lesson award, daily quest reward, and eligible achievement reward, marking every write as belonging to tx.

At beforeCommit, throw the injected error. Cross out all newly created transactional rows. Query the database outside the rejected operation and compare the result with the original fixture: no completion, review, XP, quest, or earned-achievement rows survive, and progress remains zero.

Now retry without the injected failure. The unique completion insert succeeds because the prior transaction rolled back. The award collection commits once. Send one more identical request and follow the relevant unique-conflict branch to noAwardSummary. No additional award rows should appear.

For a review exercise, imagine that the achievement helper uses the global client while all other helpers use tx. Explain the resulting broken trace and which durable assertion catches it. Also consider SQLite lock contention caused by that escaped write: a timeout is not evidence that the outer transaction correctly contained the operation. The trace must account for both client ownership and final persisted state.

## Source excerpt

From [tests/unit/completion.test.ts](../tests/unit/completion.test.ts).

```ts
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
