# 03 Fake Code Contrasts

All examples are illustrative fake code: not from this repo.

## Contrast 1: Coupling UI Shape To DB Shape

Bad:
```ts
// Illustrative fake code: not from this repo.
setCourse(await prisma.course.findMany());
```

Better:
```ts
// Illustrative fake code: not from this repo.
const viewModel = courses.map(toCatalogCard);
```

Repo pattern: query code composes feature-specific data in [`src/features/catalog/queries.ts:4-20`](../../../src/features/catalog/queries.ts#L4-L20).

## Contrast 2: Missing Permission Filter

Bad:
```ts
// Illustrative fake code: not from this repo.
await prisma.reviewState.findUnique({ where: { id } });
```

Better:
```ts
// Illustrative fake code: not from this repo.
await prisma.reviewState.findFirstOrThrow({ where: { id, userId } });
```

Repo pattern: [`src/server/review.ts:47-49`](../../../src/server/review.ts#L47-L49).

## Contrast 3: N+1 Query

Bad:
```ts
// Illustrative fake code: not from this repo.
for (const course of courses) {
  course.modules = await prisma.module.findMany({ where: { courseId: course.id } });
}
```

Better:
```ts
// Illustrative fake code: not from this repo.
await prisma.course.findMany({ include: { modules: { include: { lessons: true } } } });
```

Repo pattern: [`src/features/catalog/queries.ts:7-11`](../../../src/features/catalog/queries.ts#L7-L11).

## Contrast 4: Stale Client State As Truth

Bad:
```ts
// Illustrative fake code: not from this repo.
if (localPassed) localStorage.setItem("lessonComplete", "true");
```

Better:
```ts
// Illustrative fake code: not from this repo.
await completeLessonAction({ lessonId });
```

Repo pattern: [`src/features/lessons/lesson-player.tsx:30-34`](../../../src/features/lessons/lesson-player.tsx#L30-L34).

## Contrast 5: Side Effect In Unreliable Place

Bad:
```ts
// Illustrative fake code: not from this repo.
await sendEmail();
await writeDatabaseState();
```

Better:
```ts
// Illustrative fake code: not from this repo.
await prisma.$transaction([writeDatabaseState(), enqueueEmail()]);
```

Repo risk to discuss: cron currently returns stubbed delivery in [`src/app/api/cron/reviews/route.ts:11-18`](../../../src/app/api/cron/reviews/route.ts#L11-L18).

## Contrast 6: Swallowing Errors

Bad:
```ts
// Illustrative fake code: not from this repo.
try { await grade(); } catch {}
```

Better:
```ts
// Illustrative fake code: not from this repo.
try { await grade(); } catch (error) { report(error); throw error; }
```

Repo pattern: sandbox surfaces errors to UI in [`src/features/lessons/code-exercise.tsx:59-61`](../../../src/features/lessons/code-exercise.tsx#L59-L61).

## Contrast 7: Unsafe `any`

Bad:
```ts
// Illustrative fake code: not from this repo.
function render(item: any) { return item.payload.answer.toUpperCase(); }
```

Better:
```ts
// Illustrative fake code: not from this repo.
const item = knowledgeItemSchema.parse(raw);
```

Repo pattern: [`src/features/lessons/lesson-player.tsx:22-23`](../../../src/features/lessons/lesson-player.tsx#L22-L23).

## Contrast 8: Casual Public Contract Change

Bad:
```ts
// Illustrative fake code: not from this repo.
// Rename recallScore "good" to "ok" in UI only.
```

Better:
```ts
// Illustrative fake code: not from this repo.
// Change enum, Zod schema, UI, server mapper, tests, migration/data.
```

Repo contract: [`src/server/review.ts:7-15`](../../../src/server/review.ts#L7-L15), [`prisma/schema.prisma:27-32`](../../../prisma/schema.prisma#L27-L32).

## Contrast 9: Running User Code On Main Thread

Bad:
```ts
// Illustrative fake code: not from this repo.
new Function(userCode)();
```

Better:
```ts
// Illustrative fake code: not from this repo.
runCodeInWorker(request, 2000);
```

Repo pattern: [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35).

## Contrast 10: Trusting Client Correctness

Bad:
```ts
// Illustrative fake code: not from this repo.
awardXp({ correct: input.correct });
```

Better:
```ts
// Illustrative fake code: not from this repo.
const correct = gradeOnServer(item.payload, input.response);
```

Repo risk: [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66).
