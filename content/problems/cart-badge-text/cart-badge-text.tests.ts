import type { TestCase } from "@content/_authoring/types";

export const functionName = "cartBadgeText";

export const tests: TestCase[] = [
  {
    "name": "hides zero counts",
    "args": [
      0
    ],
    "expected": ""
  },
  {
    "name": "shows normal counts",
    "args": [
      12
    ],
    "expected": "12"
  },
  {
    "name": "caps large counts",
    "args": [
      120
    ],
    "expected": "99+",
    "hidden": true
  }
];
