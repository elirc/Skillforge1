import type { TestCase } from "@content/_authoring/types";

export const functionName = "ticketWindowSums";

export const tests: TestCase[] = [
  {
    "name": "returns rolling sums",
    "args": [
      [
        1,
        2,
        3,
        4
      ],
      2
    ],
    "expected": [
      3,
      5,
      7
    ]
  },
  {
    "name": "handles exact window size",
    "args": [
      [
        2,
        4,
        6
      ],
      3
    ],
    "expected": [
      12
    ]
  },
  {
    "name": "returns empty for large windows",
    "args": [
      [
        1,
        2
      ],
      3
    ],
    "expected": [],
    "hidden": true
  }
];
