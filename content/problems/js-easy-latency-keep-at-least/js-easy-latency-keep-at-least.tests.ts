import type { TestCase } from "@content/_authoring/types";

export const functionName = "latencyKeepAtLeast";

export const tests: TestCase[] = [
  {
    "name": "keeps qualifying values",
    "args": [
      [
        120,
        80,
        250,
        40
      ],
      100
    ],
    "expected": [
      120,
      250
    ]
  },
  {
    "name": "handles empty input",
    "args": [
      [],
      100
    ],
    "expected": []
  },
  {
    "name": "keeps values equal to minimum",
    "args": [
      [
        99,
        100,
        102
      ],
      100
    ],
    "expected": [
      100,
      102
    ],
    "hidden": true
  }
];
