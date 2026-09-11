import type { TestCase } from "@content/_authoring/types";

export const functionName = "HandleOrFallback";

export const tests: TestCase[] = [
  { name: "uses the handle when it has text", args: ["ada-l", "Ada Lovelace"], expected: "ada-l" },
  { name: "falls back when the handle is null", args: [null, "Ada Lovelace"], expected: "Ada Lovelace" },
  { name: "trims a padded handle", args: ["  grace  ", "Grace Hopper"], expected: "grace" },
  { name: "treats whitespace as missing", args: ["   ", "Grace Hopper"], expected: "Grace Hopper", hidden: true },
  { name: "treats empty string as missing", args: ["", "Alan Turing"], expected: "Alan Turing", hidden: true },
];
