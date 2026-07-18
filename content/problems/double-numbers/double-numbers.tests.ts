import type { TestCase } from "@content/_authoring/types";

export const functionName = "doubleNumbers";

export const tests: TestCase[] = [
  {
    "name": "doubles positive numbers",
    "args": [
      [
        1,
        2,
        3
      ]
    ],
    "expected": [
      2,
      4,
      6
    ]
  },
  {
    "name": "handles an empty list",
    "args": [
      []
    ],
    "expected": []
  },
  {
    "name": "doubles negatives and zero",
    "args": [
      [
        -2,
        0,
        5
      ]
    ],
    "expected": [
      -4,
      0,
      10
    ],
    "hidden": true
  }
];
