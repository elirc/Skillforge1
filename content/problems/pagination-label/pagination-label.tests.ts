import type { TestCase } from "@content/_authoring/types";

export const functionName = "paginationLabel";

export const tests: TestCase[] = [
  {
    "name": "labels the first page",
    "args": [
      1,
      10,
      35
    ],
    "expected": "1-10 of 35"
  },
  {
    "name": "labels a partial final page",
    "args": [
      4,
      10,
      35
    ],
    "expected": "31-35 of 35"
  },
  {
    "name": "handles empty results",
    "args": [
      1,
      10,
      0
    ],
    "expected": "0-0 of 0",
    "hidden": true
  }
];
