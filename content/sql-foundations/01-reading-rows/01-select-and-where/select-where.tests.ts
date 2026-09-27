import type { TestCase } from "@content/_authoring/types";

export const functionName = "selectWhere";

const users = [
  { id: 1, name: "Ada", email: "ada@example.com", age: 36 },
  { id: 2, name: "Bo", email: "bo@example.com", age: 22 },
  { id: 3, name: "Cy", email: "cy@example.com", age: 30 },
  { id: 4, name: "Di", email: "di@example.com", age: null },
];

export const tests: TestCase[] = [
  {
    name: "keeps rows with age >= 30 and projects id and name",
    args: [users, 30],
    expected: [
      { id: 1, name: "Ada" },
      { id: 3, name: "Cy" },
    ],
  },
  { name: "the boundary value is included (>=)", args: [users, 36], expected: [{ id: 1, name: "Ada" }] },
  {
    name: "a NULL age never passes the filter",
    args: [users, 0],
    expected: [
      { id: 1, name: "Ada" },
      { id: 2, name: "Bo" },
      { id: 3, name: "Cy" },
    ],
    hidden: true,
  },
  { name: "no matching rows returns an empty result", args: [users, 99], expected: [], hidden: true },
  { name: "an empty table returns an empty result", args: [[], 18], expected: [], hidden: true },
];
