import type { TestCase } from "@content/_authoring/types";

export const functionName = "customerIds";

export const tests: TestCase[] = [
  {
    "name": "returns ids",
    "args": [
      [
        {
          "id": "a",
          "name": "A"
        },
        {
          "id": "b",
          "name": "B"
        }
      ]
    ],
    "expected": [
      "a",
      "b"
    ]
  },
  {
    "name": "handles empty lists",
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
          "id": "2",
          "name": "Two"
        },
        {
          "id": "1",
          "name": "One"
        }
      ]
    ],
    "expected": [
      "2",
      "1"
    ],
    "hidden": true
  }
];
