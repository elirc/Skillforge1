# 01 Testing Strategy

## Existing Test Layers

| Layer | Files | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Unit: scheduler | [`tests/unit/srs.test.ts`](../../../tests/unit/srs.test.ts) | Recall scores update intervals/lapses | DB persistence |
| Unit: gamification | [`tests/unit/gamification.test.ts`](../../../tests/unit/gamification.test.ts) | XP, levels, streaks, achievements | Concurrent DB updates |
| Unit: sandbox | [`tests/unit/sandbox.test.ts`](../../../tests/unit/sandbox.test.ts) | Structured results and timeout | Browser Worker rendering |
| Content validation | [`scripts/validate-content.ts`](../../../scripts/validate-content.ts) | Course JSON parse and reference code tests | Pedagogical quality |
| E2E | [`tests/e2e/happy-path.spec.ts`](../../../tests/e2e/happy-path.spec.ts) | The main learner path end to end | Edge cases, and anything that needs a second day to elapse |
| CI | [`.github/workflows/ci.yml:22-28`](../../../.github/workflows/ci.yml#L22-L28) | Seeds a real SQLite file, then lint / typecheck / content validation / unit tests / build | E2E, which CI does not run |

## What Belongs Where

- Unit tests: pure logic such as [`scheduleReview`](../../../src/lib/srs/scheduler.ts#L32-L74), [`applyActivityProgress`](../../../src/lib/gamification.ts#L164-L192), [`applyStreak`](../../../src/lib/gamification.ts#L124-L156), the level curve, the sandbox harness. All of these take `now` as a parameter, which is what makes them testable at all.
- Integration tests: Prisma-backed flows such as `completeLessonAction`, `gradeReviewItem`, and the repeat-credit branches — against a throwaway SQLite file, not the learner's `data/skillforge.db`.
- UI tests: component behavior for filters, lesson checks, review reveal/grade.
- E2E tests: one or two critical learner paths with the database seeded.
- Type tests: contracts when adding new knowledge item variants.

## What Not To Test

- Tailwind class names except when accessibility/layout behavior matters.
- Prisma internals.
- Every course text string.
- Implementation details that make refactoring painful.

## Flake Prevention

- Control time when testing streaks and scheduling.
- Seed deterministic database state.
- Avoid arbitrary sleeps in Playwright.
- Prefer role-based locators, as in [`tests/e2e/happy-path.spec.ts:5-25`](../../../tests/e2e/happy-path.spec.ts#L5-L25).
