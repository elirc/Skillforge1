import type { TestCase } from "@content/_authoring/types";

export const functionName = "customerValidationErrors";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "name": "Alpha",
        "balance": 10
      }
    ],
    "expected": []
  },
  {
    "name": "reports both validation errors",
    "args": [
      {
        "name": " ",
        "balance": -1
      }
    ],
    "expected": [
      "name is required",
      "balance cannot be negative"
    ]
  },
  {
    "name": "reports amount errors only",
    "args": [
      {
        "name": "Alpha",
        "balance": -5
      }
    ],
    "expected": [
      "balance cannot be negative"
    ],
    "hidden": true
  }
];
