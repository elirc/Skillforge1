import type { TestCase } from "@content/_authoring/types";

export const functionName = "profileAriaExpanded";

export const tests: TestCase[] = [
  {
    "name": "returns true string",
    "args": [
      true
    ],
    "expected": "true"
  },
  {
    "name": "returns false string",
    "args": [
      false
    ],
    "expected": "false"
  },
  {
    "name": "does not return booleans",
    "args": [
      true
    ],
    "expected": "true",
    "hidden": true
  }
];
