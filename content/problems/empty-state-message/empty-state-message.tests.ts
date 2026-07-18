import type { TestCase } from "@content/_authoring/types";

export const functionName = "emptyStateMessage";

export const tests: TestCase[] = [
  {
    "name": "shows empty state for zero",
    "args": [
      0
    ],
    "expected": "No results"
  },
  {
    "name": "hides empty state for results",
    "args": [
      3
    ],
    "expected": ""
  },
  {
    "name": "requires exactly zero",
    "args": [
      1
    ],
    "expected": "",
    "hidden": true
  }
];
