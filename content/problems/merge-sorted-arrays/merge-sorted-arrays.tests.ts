import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergeSortedArrays";

export const tests: TestCase[] = [
  {
    "name": "merges two sorted arrays",
    "args": [
      [
        1,
        3,
        5
      ],
      [
        2,
        4
      ]
    ],
    "expected": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  {
    "name": "handles empty left arrays",
    "args": [
      [],
      [
        1,
        2
      ]
    ],
    "expected": [
      1,
      2
    ]
  },
  {
    "name": "keeps duplicates",
    "args": [
      [
        1,
        2
      ],
      [
        2,
        3
      ]
    ],
    "expected": [
      1,
      2,
      2,
      3
    ],
    "hidden": true
  }
];
