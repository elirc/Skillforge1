import type { TestCase } from "@content/_authoring/types";

export const functionName = "runRepo";

export const tests: TestCase[] = [
  {
    name: "add hands out increasing ids",
    args: [[{ op: "add", name: "pen" }, { op: "add", name: "ink" }, { op: "list" }]],
    expected: [1, 2, [{ id: 1, name: "pen" }, { id: 2, name: "ink" }]],
  },
  {
    name: "get returns the item or null",
    args: [[{ op: "add", name: "pen" }, { op: "get", id: 1 }, { op: "get", id: 9 }]],
    expected: [1, { id: 1, name: "pen" }, null],
  },
  {
    name: "rename and remove report whether the id existed",
    args: [
      [
        { op: "add", name: "pen" },
        { op: "rename", id: 1, name: "quill" },
        { op: "rename", id: 2, name: "nope" },
        { op: "remove", id: 1 },
        { op: "remove", id: 1 },
        { op: "list" },
      ],
    ],
    expected: [1, true, false, true, false, []],
  },
  {
    name: "ids are never reused after a remove",
    args: [[{ op: "add", name: "a" }, { op: "remove", id: 1 }, { op: "add", name: "b" }, { op: "list" }]],
    expected: [1, true, 2, [{ id: 2, name: "b" }]],
    hidden: true,
  },
];
