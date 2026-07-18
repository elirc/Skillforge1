import type { TestCase } from "@content/_authoring/types";

export const functionName = "invoicePageCount";

export const tests: TestCase[] = [
  {
    "name": "rounds up partial pages",
    "args": [
      21,
      10
    ],
    "expected": 3
  },
  {
    "name": "handles exact pages",
    "args": [
      20,
      10
    ],
    "expected": 2
  },
  {
    "name": "handles zero items",
    "args": [
      0,
      10
    ],
    "expected": 0,
    "hidden": true
  }
];
