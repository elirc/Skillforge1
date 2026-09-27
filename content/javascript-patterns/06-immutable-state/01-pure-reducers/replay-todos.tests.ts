import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayTodos";

export const tests: TestCase[] = [
  {
    name: "each add produces a new snapshot",
    args: [[{ type: "add", id: 1, text: "write" }, { type: "add", id: 2, text: "test" }]],
    expected: [[{ id: 1, text: "write", done: false }], [{ id: 1, text: "write", done: false }, { id: 2, text: "test", done: false }]],
  },
  {
    name: "toggle does not rewrite earlier history",
    args: [[{ type: "add", id: 1, text: "write" }, { type: "toggle", id: 1 }]],
    expected: [[{ id: 1, text: "write", done: false }], [{ id: 1, text: "write", done: true }]],
  },
  {
    name: "remove leaves the earlier snapshot intact",
    args: [[{ type: "add", id: 1, text: "a" }, { type: "add", id: 2, text: "b" }, { type: "remove", id: 1 }]],
    expected: [
      [{ id: 1, text: "a", done: false }],
      [{ id: 1, text: "a", done: false }, { id: 2, text: "b", done: false }],
      [{ id: 2, text: "b", done: false }],
    ],
  },
  {
    name: "toggling an unknown id changes nothing",
    args: [[{ type: "add", id: 1, text: "a" }, { type: "toggle", id: 7 }]],
    expected: [[{ id: 1, text: "a", done: false }], [{ id: 1, text: "a", done: false }]],
    hidden: true,
  },
];
