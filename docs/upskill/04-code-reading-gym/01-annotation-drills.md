# 01 Annotation Drills

For each excerpt, annotate inputs, outputs, dependencies, invariants, side effects, and failure modes.

## Drill 1: Lesson Completion Action
Excerpt: [`src/server/actions.ts:14-29`](../../../src/server/actions.ts#L14-L29)
- Inputs: What arrives from client?
- Dependencies: Which server modules are called?
- Side effects: List every durable write.
- Invariant: What must be true after success?
- Failure mode: What if review seeding fails after completion write?

Self-grade:
- Basic: names completion write.
- Solid: includes review seed, XP, revalidation.
- Strong: mentions transaction and authorization concerns.

## Drill 2: ReviewState Seeding
Excerpt: [`src/server/review.ts:17-37`](../../../src/server/review.ts#L17-L37)
- Why use `upsert`?
- What does `dueAt: now` imply?
- What unique index supports this?

Self-grade: strong answers cite [`prisma/schema.prisma:141-142`](../../../prisma/schema.prisma#L141-L142).

## Drill 3: Scheduler
Excerpt: [`src/lib/srs/scheduler.ts:32-66`](../../../src/lib/srs/scheduler.ts#L32-L66)
- Identify deterministic inputs.
- Explain each recall branch.
- Name one edge case.

Self-grade: strong answers connect to tests in [`tests/unit/srs.test.ts:15-44`](../../../tests/unit/srs.test.ts#L15-L44).

## Drill 4: Gamification Streak Logic
Excerpt: [`src/lib/gamification.ts:37-70`](../../../src/lib/gamification.ts#L37-L70)
- Trace gap = null, 0, 1, 2 with freeze, 2 without freeze.
- What is the invariant for `streakLongest`?
- What timezone assumption exists?

## Drill 5: Review Grading
Excerpt: [`src/server/review.ts:39-91`](../../../src/server/review.ts#L39-L91)
- Where is authorization checked?
- Which values are server-derived?
- Which values are client-derived?
- What should be transactional?

## Drill 6: Sandbox Harness
Excerpt: [`src/lib/sandbox/shared.ts:33-76`](../../../src/lib/sandbox/shared.ts#L33-L76)
- What APIs are disabled?
- Where is user code invoked?
- What is the output contract?
- What does this not protect against?

## Drill 7: CodeMirror Integration
Excerpt: [`src/features/lessons/code-exercise.tsx:25-62`](../../../src/features/lessons/code-exercise.tsx#L25-L62)
- What creates the editor?
- Where is buffer state stored?
- How are errors surfaced?
- What cleanup prevents leaks?

## Drill 8: Content Validation
Excerpt: [`scripts/validate-content.ts:6-29`](../../../scripts/validate-content.ts#L6-L29)
- What files are read?
- Which knowledge item types are executed?
- What failure stops CI?

## Drill 9: Course Query
Excerpt: [`src/features/catalog/queries.ts:22-40`](../../../src/features/catalog/queries.ts#L22-L40)
- What is included?
- Where is user scoping applied?
- What would grow expensive?

## Drill 10: Cron Stub
Excerpt: [`src/app/api/cron/reviews/route.ts:4-19`](../../../src/app/api/cron/reviews/route.ts#L4-L19)
- What query is run?
- What is stubbed?
- What auth/retry/observability is missing?

## General Rubric

- Weak: paraphrases code line by line.
- Solid: names data ownership, input/output shape, and side effects.
- Strong: identifies invariants, tests, failure modes, and alternative designs.
