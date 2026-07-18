import type { TestCase } from "@content/_authoring/types";

export const functionName = "productStatusLabel";

export const tests: TestCase[] = [
  {
    "name": "labels active values",
    "args": [
      true
    ],
    "expected": "Active"
  },
  {
    "name": "labels inactive values",
    "args": [
      false
    ],
    "expected": "Inactive"
  },
  {
    "name": "returns exact casing",
    "args": [
      true
    ],
    "expected": "Active",
    "hidden": true
  }
];
