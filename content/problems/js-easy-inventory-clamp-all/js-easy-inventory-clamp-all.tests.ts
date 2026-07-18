import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryClampAll";

export const tests: TestCase[] = [
  {
    "name": "clamps low and high values",
    "args": [
      [
        -5,
        10,
        35
      ],
      0,
      30
    ],
    "expected": [
      0,
      10,
      30
    ]
  },
  {
    "name": "keeps values inside the range",
    "args": [
      [
        0,
        10
      ],
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      0,
      30
    ],
    "expected": [],
    "hidden": true
  }
];
