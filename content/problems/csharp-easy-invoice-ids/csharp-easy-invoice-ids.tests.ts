import type { TestCase } from "@content/_authoring/types";

export const functionName = "invoiceIds";

export const tests: TestCase[] = [
  {
    "name": "returns ids",
    "args": [
      [
        {
          "id": "a",
          "number": "A"
        },
        {
          "id": "b",
          "number": "B"
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
          "number": "Two"
        },
        {
          "id": "1",
          "number": "One"
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
