import type { TestCase } from "@content/_authoring/types";

export const functionName = "toCreateTodoDto";

export const tests: TestCase[] = [
  {
    name: "converts a filled-in form",
    args: [{ title: " Ship v2 ", tags: "work, release", dueDate: "2026-10-01", priority: "1" }],
    expected: { title: "Ship v2", tags: ["work", "release"], dueDate: "2026-10-01", priority: 1 },
  },
  {
    name: "an empty date becomes null",
    args: [{ title: "Read", tags: "", dueDate: "", priority: "2" }],
    expected: { title: "Read", tags: [], dueDate: null, priority: 2 },
  },
  {
    name: "normalizes and dedupes tags",
    args: [{ title: "Plan", tags: "Work, work ,URGENT,, ", dueDate: "", priority: "3" }],
    expected: { title: "Plan", tags: ["work", "urgent"], dueDate: null, priority: 3 },
  },
  {
    name: "an unknown priority falls back to 2",
    args: [{ title: "Call", tags: "", dueDate: "", priority: "high" }],
    expected: { title: "Call", tags: [], dueDate: null, priority: 2 },
  },
  {
    name: "priority is a number, not a string",
    args: [{ title: "x", tags: "", dueDate: "", priority: "3" }],
    expected: { title: "x", tags: [], dueDate: null, priority: 3 },
  },
  {
    name: "a whitespace-only date is empty",
    args: [{ title: "x", tags: "a", dueDate: "   ", priority: " 1 " }],
    expected: { title: "x", tags: ["a"], dueDate: null, priority: 1 },
    hidden: true,
  },
  {
    name: "priority 4 is out of range",
    args: [{ title: "x", tags: "", dueDate: "", priority: "4" }],
    expected: { title: "x", tags: [], dueDate: null, priority: 2 },
    hidden: true,
  },
];
