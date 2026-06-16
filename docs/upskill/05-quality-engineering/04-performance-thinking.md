# 04 Performance Thinking

## Performance Domains

| Domain | Hotspot anchors | What to measure |
| --- | --- | --- |
| Render | [`src/features/catalog/catalog-client.tsx:39-49`](../../../src/features/catalog/catalog-client.tsx#L39-L49) | Large course list filter cost |
| Network/server | [`src/features/review/queries.ts:8-25`](../../../src/features/review/queries.ts#L8-L25) | Due queue latency |
| DB | [`prisma/schema.prisma:141-142`](../../../prisma/schema.prisma#L141-L142) | Index use for due reviews |
| Worker | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) | Timeout, CPU, memory |
| Bundle | CodeMirror import in [`src/features/lessons/code-exercise.tsx:3-14`](../../../src/features/lessons/code-exercise.tsx#L3-L14) | Lesson bundle size |
| Startup | Next app routes | Cold start DB connection |
| Cache | Revalidation in [`src/server/actions.ts:26-28`](../../../src/server/actions.ts#L26-L28) | Stale/fresh page behavior |

## Measure First

Do not optimize because a loop looks ugly. Measure:
- Browser performance panel for render/worker.
- Next build output for bundle shape.
- Prisma query logs for DB latency and N+1.
- DB `EXPLAIN` for due queue.

## Likely Hotspots

- Catalog client filtering recomputes on every render; fine for seed size, consider server search or memoized normalized index later.
- Nested course includes in [`src/features/catalog/queries.ts:7-13`](../../../src/features/catalog/queries.ts#L7-L13) may over-fetch with many lessons.
- Review queue includes course/module/lesson for each item in [`src/features/review/queries.ts:10-21`](../../../src/features/review/queries.ts#L10-L21); consider a DTO query if it grows.
- CodeMirror can be heavy; lazy-load code exercise UI if lesson pages become slow.

## Drill

Create a performance experiment for 1,000 courses and 10,000 ReviewState rows. Define:
- seed shape,
- metric,
- acceptable threshold,
- expected bottleneck,
- rollback if optimization complicates code too much.
