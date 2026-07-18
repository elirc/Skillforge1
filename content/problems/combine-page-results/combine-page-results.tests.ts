import type { TestCase } from "@content/_authoring/types";

export const functionName = "combinePageResults";

export const tests: TestCase[] = [
  {
    "name": "combines pages",
    "args": [
      [
        {
          "items": [
            1,
            2
          ]
        },
        {
          "items": [
            3
          ]
        }
      ]
    ],
    "expected": [
      1,
      2,
      3
    ]
  },
  {
    "name": "handles empty pages",
    "args": [
      [
        {
          "items": []
        },
        {
          "items": [
            "a"
          ]
        }
      ]
    ],
    "expected": [
      "a"
    ]
  },
  {
    "name": "handles no pages",
    "args": [
      []
    ],
    "expected": [],
    "hidden": true
  }
];
