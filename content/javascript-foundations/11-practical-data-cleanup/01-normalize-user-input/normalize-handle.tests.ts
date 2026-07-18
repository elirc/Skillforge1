import type { TestCase } from "@content/_authoring/types";

export const functionName = "normalizeHandle";

export const tests: TestCase[] = [
  { name: "trims and lowercases", args: ["  AdaLovelace  "], expected: "adalovelace" },
  { name: "removes a leading at sign", args: [" @Grace "], expected: "grace" },
  { name: "keeps inner symbols", args: ["Team@Skillforge"], expected: "team@skillforge", hidden: true },
];
