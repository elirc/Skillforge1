import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryScaleValues";

export const tests: TestCase[] = [
  {
    "name": "scales each value",
    "args": [
      [
        1,
        2,
        3
      ],
      5
    ],
    "expected": [
      5,
      10,
      15
    ]
  },
  {
    "name": "handles zero factor",
    "args": [
      [
        4,
        5
      ],
      0
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      5
    ],
    "expected": [],
    "hidden": true
  }
];
