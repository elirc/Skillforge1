import type { TestCase } from "@content/_authoring/types";

export const functionName = "Handle";

const lessons = [
  { Id: "linq-basics", ConceptTags: ["linq", "collections"] },
  { Id: "async-intro", ConceptTags: ["async", "tasks", "async"] },
  { Id: "empty", ConceptTags: [] },
];

export const tests: TestCase[] = [
  {
    name: "completes a lesson and seeds its concepts in sorted order",
    args: ["user-1", "linq-basics", lessons, []],
    expected: { Status: 200, Code: "completed", SeededConcepts: ["collections", "linq"] },
  },
  {
    name: "returns 401 when there is no signed-in user",
    args: [null, "linq-basics", lessons, []],
    expected: { Status: 401, Code: "unauthenticated", SeededConcepts: [] },
  },
  {
    name: "returns 404 for an unknown lesson",
    args: ["user-1", "missing", lessons, []],
    expected: { Status: 404, Code: "lesson-not-found", SeededConcepts: [] },
  },
  {
    name: "completing twice is idempotent and seeds nothing new",
    args: ["user-1", "linq-basics", lessons, ["linq-basics"]],
    expected: { Status: 200, Code: "already-completed", SeededConcepts: [] },
  },
  {
    name: "returns 400 for a blank lesson id",
    args: ["user-1", "   ", lessons, []],
    expected: { Status: 400, Code: "invalid-lesson-id", SeededConcepts: [] },
  },
  {
    name: "seeds each concept only once",
    args: ["user-1", "async-intro", lessons, ["linq-basics"]],
    expected: { Status: 200, Code: "completed", SeededConcepts: ["async", "tasks"] },
    hidden: true,
  },
  {
    name: "checks authentication before validating the route",
    args: ["  ", "", lessons, []],
    expected: { Status: 401, Code: "unauthenticated", SeededConcepts: [] },
    hidden: true,
  },
  {
    name: "a lesson with no concepts still completes",
    args: ["user-1", "empty", lessons, []],
    expected: { Status: 200, Code: "completed", SeededConcepts: [] },
    hidden: true,
  },
];
