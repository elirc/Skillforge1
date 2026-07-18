import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryCountAtLeast";

export const tests: TestCase[] = [
  {
    "name": "counts values at or above minimum",
    "args": [
      [
        0,
        4,
        11,
        20
      ],
      10
    ],
    "expected": 2
  },
  {
    "name": "returns zero when none qualify",
    "args": [
      [
        -2,
        -1
      ],
      10
    ],
    "expected": 0
  },
  {
    "name": "counts values equal to minimum",
    "args": [
      [
        10,
        9,
        11
      ],
      10
    ],
    "expected": 2,
    "hidden": true
  }
];
