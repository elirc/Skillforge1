import type { TestCase } from "@content/_authoring/types";

export const functionName = "profileBadgeText";

export const tests: TestCase[] = [
  {
    "name": "hides zero counts",
    "args": [
      0
    ],
    "expected": ""
  },
  {
    "name": "shows small counts",
    "args": [
      5
    ],
    "expected": "5"
  },
  {
    "name": "caps large counts",
    "args": [
      12
    ],
    "expected": "9+",
    "hidden": true
  }
];
