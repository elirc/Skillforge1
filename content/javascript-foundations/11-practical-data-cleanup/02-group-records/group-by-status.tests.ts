import type { TestCase } from "@content/_authoring/types";

export const functionName = "groupByStatus";

export const tests: TestCase[] = [
  {
    name: "groups lessons under matching status keys",
    args: [[{ title: "Arrays", status: "done" }, { title: "Objects", status: "new" }, { title: "Loops", status: "done" }]],
    expected: {
      done: [{ title: "Arrays", status: "done" }, { title: "Loops", status: "done" }],
      new: [{ title: "Objects", status: "new" }],
    },
  },
  { name: "handles an empty list", args: [[]], expected: {}, hidden: true },
];
