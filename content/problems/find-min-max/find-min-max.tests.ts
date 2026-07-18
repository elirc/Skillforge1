import type { TestCase } from "@content/_authoring/types";

export const functionName = "findMinMax";

export const tests: TestCase[] = [
  {
    "name": "finds min and max",
    "args": [
      [
        4,
        1,
        9,
        2
      ]
    ],
    "expected": {
      "min": 1,
      "max": 9
    }
  },
  {
    "name": "handles one value",
    "args": [
      [
        7
      ]
    ],
    "expected": {
      "min": 7,
      "max": 7
    }
  },
  {
    "name": "handles empty arrays",
    "args": [
      []
    ],
    "expected": {
      "min": null,
      "max": null
    },
    "hidden": true
  }
];
