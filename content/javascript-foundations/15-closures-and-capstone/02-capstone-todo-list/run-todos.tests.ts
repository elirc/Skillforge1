import type { TestCase } from "@content/_authoring/types";

export const functionName = "runTodos";

export const tests: TestCase[] = [
  {
    name: "add creates todos with ids 1, 2, 3",
    args: [
      [
        { type: "add", text: "Read lesson" },
        { type: "add", text: "Do review" },
      ],
    ],
    expected: {
      todos: [
        { id: 1, text: "Read lesson", done: false },
        { id: 2, text: "Do review", done: false },
      ],
      remaining: 2,
    },
  },
  {
    name: "toggle flips done and remaining counts only open todos",
    args: [
      [
        { type: "add", text: "A" },
        { type: "add", text: "B" },
        { type: "toggle", id: 1 },
      ],
    ],
    expected: {
      todos: [
        { id: 1, text: "A", done: true },
        { id: 2, text: "B", done: false },
      ],
      remaining: 1,
    },
  },
  {
    name: "text is trimmed and blank todos are ignored",
    args: [
      [
        { type: "add", text: "   " },
        { type: "add", text: "  Stretch  " },
      ],
    ],
    expected: { todos: [{ id: 1, text: "Stretch", done: false }], remaining: 1 },
  },
  {
    name: "rename changes text; a blank rename is ignored",
    args: [
      [
        { type: "add", text: "Old" },
        { type: "rename", id: 1, text: " New " },
        { type: "rename", id: 1, text: "" },
      ],
    ],
    expected: { todos: [{ id: 1, text: "New", done: false }], remaining: 1 },
  },
  {
    name: "remove deletes by id and ids are never reused",
    args: [
      [
        { type: "add", text: "A" },
        { type: "add", text: "B" },
        { type: "remove", id: 2 },
        { type: "add", text: "C" },
      ],
    ],
    expected: {
      todos: [
        { id: 1, text: "A", done: false },
        { id: 3, text: "C", done: false },
      ],
      remaining: 2,
    },
  },
  {
    name: "clearDone removes finished todos",
    args: [
      [
        { type: "add", text: "A" },
        { type: "add", text: "B" },
        { type: "add", text: "C" },
        { type: "toggle", id: 1 },
        { type: "toggle", id: 3 },
        { type: "clearDone" },
      ],
    ],
    expected: { todos: [{ id: 2, text: "B", done: false }], remaining: 1 },
  },
  {
    name: "commands for unknown ids and unknown types do nothing",
    args: [
      [
        { type: "add", text: "A" },
        { type: "toggle", id: 99 },
        { type: "remove", id: 42 },
        { type: "explode" },
      ],
    ],
    expected: { todos: [{ id: 1, text: "A", done: false }], remaining: 1 },
    hidden: true,
  },
  {
    name: "toggling twice undoes it",
    args: [
      [
        { type: "add", text: "A" },
        { type: "toggle", id: 1 },
        { type: "toggle", id: 1 },
      ],
    ],
    expected: { todos: [{ id: 1, text: "A", done: false }], remaining: 1 },
    hidden: true,
  },
];
