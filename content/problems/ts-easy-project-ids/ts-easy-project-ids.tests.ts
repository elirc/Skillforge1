import type { TestCase } from "@content/_authoring/types";

export const functionName = "projectIds";

export const tests: TestCase[] = [
  {
    "name": "returns ids",
    "args": [
      [
        {
          "id": "1",
          "title": "One"
        },
        {
          "id": "2",
          "title": "Two"
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
          "title": "B"
        },
        {
          "id": "a",
          "title": "A"
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
