import type { TestCase } from "@content/_authoring/types";

export const functionName = "Diagnose";

// DateTime values are ISO-8601 strings.
const now = "2026-06-16T12:00:00Z";
const earlier = "2026-06-16T08:00:00Z";
const tomorrow = "2026-06-17T08:00:00Z";

const completions = [{ UserId: "u1", LessonId: "linq" }];
const items = [
  { Id: "k1", LessonId: "linq" },
  { Id: "k2", LessonId: "linq" },
  { Id: "k9", LessonId: "async" },
];
const state = (UserId: string, KnowledgeItemId: string, DueAt: string) => ({ UserId, KnowledgeItemId, DueAt });

export const tests: TestCase[] = [
  {
    name: "a healthy lesson reports ok",
    args: ["u1", "linq", now, completions, items, [state("u1", "k1", earlier), state("u1", "k2", tomorrow)]],
    expected: "ok",
  },
  {
    name: "the completion row was never written",
    args: ["u1", "async", now, completions, items, []],
    expected: "missing-completion",
  },
  {
    name: "the review seeder never ran",
    args: ["u1", "linq", now, completions, items, []],
    expected: "missing-review-states",
  },
  {
    name: "rows exist, but for a different user",
    args: ["u1", "linq", now, completions, items, [state("u2", "k1", earlier), state("u2", "k2", earlier)]],
    expected: "seeded-for-wrong-user",
  },
  {
    name: "every review is scheduled in the future",
    args: ["u1", "linq", now, completions, items, [state("u1", "k1", tomorrow), state("u1", "k2", tomorrow)]],
    expected: "none-due-yet",
  },
  {
    name: "only some items were seeded",
    args: ["u1", "linq", now, completions, items, [state("u1", "k1", earlier), state("u2", "k2", earlier)]],
    expected: "partially-seeded",
    hidden: true,
  },
  {
    name: "a lesson with no knowledge items has nothing to review",
    args: ["u1", "intro", now, [{ UserId: "u1", LessonId: "intro" }], items, []],
    expected: "lesson-has-no-items",
    hidden: true,
  },
  {
    name: "a review due exactly now counts as due",
    args: ["u1", "linq", now, completions, items, [state("u1", "k1", now), state("u1", "k2", tomorrow)]],
    expected: "ok",
    hidden: true,
  },
];
