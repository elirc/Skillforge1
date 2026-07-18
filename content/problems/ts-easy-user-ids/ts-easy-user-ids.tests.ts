import type { TestCase } from "@content/_authoring/types";

export const functionName = "userIds";

export const tests: TestCase[] = [
  {
    "name": "returns ids",
    "args": [
      [
        {
          "id": "1",
          "name": "One"
        },
        {
          "id": "2",
          "name": "Two"
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
          "name": "B"
        },
        {
          "id": "a",
          "name": "A"
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
