import type { TestCase } from "@content/_authoring/types";

export const functionName = "fullName";

export const tests: TestCase[] = [
  { name: "joins first and last", args: [{ first: "Ada", last: "Lovelace" }], expected: "Ada Lovelace" },
  { name: "works for another name", args: [{ first: "Grace", last: "Hopper" }], expected: "Grace Hopper", hidden: true },
];
