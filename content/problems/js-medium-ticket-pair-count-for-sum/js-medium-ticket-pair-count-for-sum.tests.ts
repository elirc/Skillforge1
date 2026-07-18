import type { TestCase } from "@content/_authoring/types";

export const functionName = "ticketPairCountForSum";

export const tests: TestCase[] = [
  {
    "name": "counts matching pairs",
    "args": [
      [
        1,
        2,
        3,
        4
      ],
      5
    ],
    "expected": 2
  },
  {
    "name": "counts duplicate pairs",
    "args": [
      [
        2,
        2,
        2
      ],
      4
    ],
    "expected": 3
  },
  {
    "name": "returns zero when none match",
    "args": [
      [
        1,
        2
      ],
      10
    ],
    "expected": 0,
    "hidden": true
  }
];
