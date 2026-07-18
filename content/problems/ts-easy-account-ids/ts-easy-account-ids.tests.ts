import type { TestCase } from "@content/_authoring/types";

export const functionName = "accountIds";

export const tests: TestCase[] = [
  {
    "name": "returns ids",
    "args": [
      [
        {
          "id": "1",
          "displayName": "One"
        },
        {
          "id": "2",
          "displayName": "Two"
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
          "displayName": "B"
        },
        {
          "id": "a",
          "displayName": "A"
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
