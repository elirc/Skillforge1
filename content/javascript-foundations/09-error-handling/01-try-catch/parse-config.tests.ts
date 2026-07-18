import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseConfig";

export const tests: TestCase[] = [
  { name: "parses valid JSON", args: ["{\"xp\":10}"], expected: { xp: 10 } },
  { name: "falls back on invalid JSON", args: ["not json"], expected: {} },
  { name: "parses an empty object", args: ["{}"], expected: {}, hidden: true },
];
