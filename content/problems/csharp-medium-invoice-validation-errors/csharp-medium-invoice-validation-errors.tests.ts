import type { TestCase } from "@content/_authoring/types";

export const functionName = "invoiceValidationErrors";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "number": "Alpha",
        "amount": 10
      }
    ],
    "expected": []
  },
  {
    "name": "reports both validation errors",
    "args": [
      {
        "number": " ",
        "amount": -1
      }
    ],
    "expected": [
      "number is required",
      "amount cannot be negative"
    ]
  },
  {
    "name": "reports amount errors only",
    "args": [
      {
        "number": "Alpha",
        "amount": -5
      }
    ],
    "expected": [
      "amount cannot be negative"
    ],
    "hidden": true
  }
];
