import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizPickNames";

export const tests: TestCase[] = [
  {
    "name": "picks names from rows",
    "args": [
      [
        {
          "name": "Ada"
        },
        {
          "name": "Grace"
        }
      ]
    ],
    "expected": [
      "Ada",
      "Grace"
    ]
  },
  {
    "name": "handles empty rows",
    "args": [
      []
    ],
    "expected": []
  },
  {
    "name": "preserves order",
    "args": [
      [
        {
          "name": "First"
        },
        {
          "name": "Second"
        }
      ]
    ],
    "expected": [
      "First",
      "Second"
    ],
    "hidden": true
  }
];
