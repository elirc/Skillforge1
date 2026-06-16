# 01 Boundaries And Layers

## Layer Map

| Layer | Owns | Must not own | Examples |
| --- | --- | --- | --- |
| Route | URL params, page composition | Domain mutation rules | [`src/app/courses/[slug]/page.tsx:27-97`](../../../src/app/courses/%5Bslug%5D/page.tsx#L27-L97) |
| Client feature | Interaction state, optimistic UI hints | Durable progress | [`src/features/lessons/lesson-player.tsx:24-34`](../../../src/features/lessons/lesson-player.tsx#L24-L34) |
| Server action | Input validation, user derivation, mutation orchestration | UI rendering | [`src/server/actions.ts:10-48`](../../../src/server/actions.ts#L10-L48) |
| Domain service | Business rules and side effects | Button state | [`src/server/review.ts:17-91`](../../../src/server/review.ts#L17-L91) |
| Pure library | Deterministic algorithm | DB calls | [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74) |
| Persistence | Durable schema and constraints | Client view models | [`prisma/schema.prisma:41-287`](../../../prisma/schema.prisma#L41-L287) |
| Worker | Isolated user code execution | DB writes | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) |

## Good Boundaries

- Scheduler is pure and unit-tested: [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74), [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).
- Gamification calculation is pure in [`src/lib/gamification.ts:37-79`](../../../src/lib/gamification.ts#L37-L79), while DB persistence is separate in [`src/server/gamification.ts:4-69`](../../../src/server/gamification.ts#L4-L69).
- Sandbox has shared request/result types in [`src/lib/sandbox/shared.ts:3-31`](../../../src/lib/sandbox/shared.ts#L3-L31) and runtime-specific runners.

## Boundary Leaks Or Risks

- Review UI sends `correct` to server in [`src/features/review/review-session.tsx:62-66`](../../../src/features/review/review-session.tsx#L62-L66). For MCQ/cloze, the server could derive correctness from the KnowledgeItem payload.
- Lesson completion relies on client-side pass state before calling the action in [`src/features/lessons/lesson-player.tsx:28-34`](../../../src/features/lessons/lesson-player.tsx#L28-L34). Server still needs authorization and completion rules.
- Cron route has no visible auth guard in [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19).

## Drill

For each leak, write:
- Boundary crossed.
- Why it might be okay for a demo.
- What production invariant is missing.
- One test that would expose the issue.
