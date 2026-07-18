import type { TestCase } from "@content/_authoring/types";

export const functionName = "frequencySort";

export const tests: TestCase[] = [
  { name: "sorts by highest frequency", args: [["js", "ts", "js", "css", "ts", "js"]], expected: ["js", "ts", "css"] },
  { name: "breaks ties alphabetically", args: [["beta", "alpha", "beta", "alpha", "gamma"]], expected: ["alpha", "beta", "gamma"] },
  { name: "handles empty input", args: [[]], expected: [], hidden: true },
];
