import type { TestCase } from "@content/_authoring/types";

export const functionName = "latencyClampAll";

export const tests: TestCase[] = [
  {
    "name": "clamps low and high values",
    "args": [
      [
        45,
        100,
        305
      ],
      50,
      300
    ],
    "expected": [
      50,
      100,
      300
    ]
  },
  {
    "name": "keeps values inside the range",
    "args": [
      [
        50,
        100
      ],
      50,
      300
    ],
    "expected": [
      50,
      100
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      50,
      300
    ],
    "expected": [],
    "hidden": true
  }
];
