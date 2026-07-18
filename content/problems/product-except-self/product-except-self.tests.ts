import type { TestCase } from "@content/_authoring/types";

export const functionName = "productExceptSelf";

export const tests: TestCase[] = [
  {
    "name": "builds products except self",
    "args": [
      [
        1,
        2,
        3,
        4
      ]
    ],
    "expected": [
      24,
      12,
      8,
      6
    ]
  },
  {
    "name": "handles zeros",
    "args": [
      [
        1,
        2,
        0,
        4
      ]
    ],
    "expected": [
      0,
      0,
      8,
      0
    ]
  },
  {
    "name": "handles two numbers",
    "args": [
      [
        5,
        9
      ]
    ],
    "expected": [
      9,
      5
    ],
    "hidden": true
  }
];
