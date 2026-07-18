import type { TestCase } from "@content/_authoring/types";

export const functionName = "dashboardEmptyMessage";

export const tests: TestCase[] = [
  {
    "name": "shows empty message",
    "args": [
      0
    ],
    "expected": "No dashboard items"
  },
  {
    "name": "hides message when items exist",
    "args": [
      2
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
