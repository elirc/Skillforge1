import type { TestCase } from "@content/_authoring/types";

export const functionName = "dashboardPaginationLabel";

export const tests: TestCase[] = [
  {
    "name": "labels first page",
    "args": [
      1,
      10,
      25
    ],
    "expected": "1-10 of 25"
  },
  {
    "name": "labels partial page",
    "args": [
      3,
      10,
      25
    ],
    "expected": "21-25 of 25"
  },
  {
    "name": "handles empty totals",
    "args": [
      1,
      10,
      0
    ],
    "expected": "0-0 of 0",
    "hidden": true
  }
];
