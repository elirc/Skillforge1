# 01 Boundaries And Layers

## Layer Map

| Layer | Owns | Must not own | Examples |
| --- | --- | --- | --- |
| Route | URL params, page composition | Domain mutation rules | [`src/app/courses/[slug]/page.tsx:46-97`](../../../src/app/courses/%5Bslug%5D/page.tsx#L46-L97) |
| Client feature | Interaction state, optimistic UI hints | Durable progress | [`src/features/lessons/lesson-player.tsx:24-34`](../../../src/features/lessons/lesson-player.tsx#L24-L34) |
| Server action | Input validation, user derivation, mutation orchestration | UI rendering | [`src/server/actions.ts:19-61`](../../../src/server/actions.ts#L19-L61) |
| Domain service | Business rules and side effects | Button state | [`src/server/review.ts:17-91`](../../../src/server/review.ts#L17-L91) |
| Pure library | Deterministic algorithm | DB calls | [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74), [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) |
| Persistence | Durable schema and constraints | Client view models | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| Worker | Isolated user code execution | DB writes | [`src/lib/sandbox/client-runner.ts:9-35`](../../../src/lib/sandbox/client-runner.ts#L9-L35) |

## Good Boundaries

- Scheduler is pure and unit-tested: [`src/lib/srs/scheduler.ts:32-74`](../../../src/lib/srs/scheduler.ts#L32-L74), [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).
- Gamification calculation is pure in [`src/lib/gamification.ts`](../../../src/lib/gamification.ts) — XP, streak, level curve, quest templates, achievement rules, all with `now` passed in — while DB persistence is separate in [`src/server/gamification.ts`](../../../src/server/gamification.ts) and funnelled through one function, [`awardActivity`](../../../src/server/gamification.ts#L61-L123).
- The string-typed SQLite columns are parsed at exactly one boundary, [`src/lib/enums.ts`](../../../src/lib/enums.ts), instead of being cast at each call site.
- Sandbox has shared request/result types in [`src/lib/sandbox/shared.ts:3-31`](../../../src/lib/sandbox/shared.ts#L3-L31) and runtime-specific runners.

## Boundary Leaks Or Risks

- Review UI sends `correct` to server in [`src/features/review/review-session.tsx:59-70`](../../../src/features/review/review-session.tsx#L59-L70). For MCQ/cloze, the server could derive correctness from the KnowledgeItem payload.
- Lesson completion relies on client-side pass state before calling the action in [`src/features/lessons/lesson-player.tsx:28-34`](../../../src/features/lessons/lesson-player.tsx#L28-L34). The server enforces only the repeat-credit rule, not "did you actually do the work."
- Ranking logic sits in the server layer but reads like presentation: [`getNextUp`](../../../src/server/feed.ts#L134-L198) decides both *what* the dashboard shows and *in what order*, with the weights inline. Ask whether the ordering rule is a domain rule or a view concern, and where it would have to live to be unit-testable.

## Drill

For each leak, write:
- Boundary crossed.
- Why it might be okay for a single local learner.
- What invariant is missing if this were ever shared.
- One test that would expose the issue.
