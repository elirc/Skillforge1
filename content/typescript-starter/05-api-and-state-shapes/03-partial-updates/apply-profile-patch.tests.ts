import type { TestCase } from "@content/_authoring/types";

export const functionName = "applyProfilePatch";

export const tests: TestCase[] = [
  {
    name: "updates one field",
    args: [{ name: "Ada", goal: "JS", streak: 3 }, { goal: "TypeScript" }],
    expected: { name: "Ada", goal: "TypeScript", streak: 3 },
  },
  {
    name: "updates multiple fields",
    args: [{ name: "Ada", goal: "JS", streak: 3 }, { name: "Grace", streak: 4 }],
    expected: { name: "Grace", goal: "JS", streak: 4 },
    hidden: true,
  },
];
