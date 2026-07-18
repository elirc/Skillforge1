import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryKeepAtLeast";

export const tests: TestCase[] = [
  {
    "name": "keeps qualifying values",
    "args": [
      [
        0,
        4,
        11,
        20
      ],
      10
    ],
    "expected": [
      11,
      20
    ]
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      10
    ],
    "expected": []
  },
  {
    "name": "keeps values equal to minimum",
    "args": [
      [
        9,
        10,
        12
      ],
      10
    ],
    "expected": [
      10,
      12
    ],
    "hidden": true
  }
];
