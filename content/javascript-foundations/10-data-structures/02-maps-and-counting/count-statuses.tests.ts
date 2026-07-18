import type { TestCase } from "@content/_authoring/types";

export const functionName = "countStatuses";

export const tests: TestCase[] = [
  { name: "counts repeated statuses", args: [["new", "done", "new"]], expected: { new: 2, done: 1 } },
  { name: "returns an empty object for no statuses", args: [[]], expected: {}, hidden: true },
];
