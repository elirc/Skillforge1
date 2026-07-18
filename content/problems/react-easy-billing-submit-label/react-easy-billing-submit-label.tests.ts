import type { TestCase } from "@content/_authoring/types";

export const functionName = "billingSubmitLabel";

export const tests: TestCase[] = [
  {
    "name": "shows saving text",
    "args": [
      true
    ],
    "expected": "Saving..."
  },
  {
    "name": "shows default text",
    "args": [
      false
    ],
    "expected": "Save"
  },
  {
    "name": "returns exact copy",
    "args": [
      true
    ],
    "expected": "Saving...",
    "hidden": true
  }
];
