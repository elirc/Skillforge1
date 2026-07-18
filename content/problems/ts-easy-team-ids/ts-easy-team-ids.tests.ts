import type { TestCase } from "@content/_authoring/types";

export const functionName = "teamIds";

export const tests: TestCase[] = [
  {
    "name": "returns ids",
    "args": [
      [
        {
          "id": "1",
          "label": "One"
        },
        {
          "id": "2",
          "label": "Two"
        }
      ]
    ],
    "expected": [
      "1",
      "2"
    ]
  },
  {
    "name": "handles empty arrays",
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
          "id": "b",
          "label": "B"
        },
        {
          "id": "a",
          "label": "A"
        }
      ]
    ],
    "expected": [
      "b",
      "a"
    ],
    "hidden": true
  }
];
