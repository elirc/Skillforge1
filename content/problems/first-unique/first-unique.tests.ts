import type { TestCase } from "@content/_authoring/types";

export const functionName = "firstUnique";

export const tests: TestCase[] = [
  { name: "all characters unique", args: ["forge"], expected: "f" },
  { name: "skips repeated leading characters", args: ["swiss"], expected: "w" },
  { name: "no unique character", args: ["aabb"], expected: "" },
  { name: "later unique after repeats", args: ["aabbc"], expected: "c", hidden: true },
];
