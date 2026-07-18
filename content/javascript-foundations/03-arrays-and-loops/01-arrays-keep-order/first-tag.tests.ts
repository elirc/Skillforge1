import type { TestCase } from "@content/_authoring/types";

export const functionName = "firstTag";

export const tests: TestCase[] = [
  { name: "reads first item", args: [["arrays", "loops"]], expected: "arrays" },
  { name: "reads another first item", args: [["review", "xp"]], expected: "review", hidden: true },
];
