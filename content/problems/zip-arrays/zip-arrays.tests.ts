import type { TestCase } from "@content/_authoring/types";

export const functionName = "zipArrays";

export const tests: TestCase[] = [
  {
    "name": "zips matching arrays",
    "args": [
      [
        1,
        2
      ],
      [
        "a",
        "b"
      ]
    ],
    "expected": [
      [
        1,
        "a"
      ],
      [
        2,
        "b"
      ]
    ]
  },
  {
    "name": "stops at shorter arrays",
    "args": [
      [
        1,
        2,
        3
      ],
      [
        "a"
      ]
    ],
    "expected": [
      [
        1,
        "a"
      ]
    ]
  },
  {
    "name": "handles empty arrays",
    "args": [
      [],
      [
        "a"
      ]
    ],
    "expected": [],
    "hidden": true
  }
];
