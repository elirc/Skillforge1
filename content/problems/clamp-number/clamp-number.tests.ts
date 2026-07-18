import type { TestCase } from "@content/_authoring/types";

export const functionName = "clampNumber";

export const tests: TestCase[] = [
  {
    "name": "keeps values inside the range",
    "args": [
      5,
      0,
      10
    ],
    "expected": 5
  },
  {
    "name": "clamps low values",
    "args": [
      -4,
      0,
      10
    ],
    "expected": 0
  },
  {
    "name": "clamps high values",
    "args": [
      14,
      0,
      10
    ],
    "expected": 10,
    "hidden": true
  }
];
