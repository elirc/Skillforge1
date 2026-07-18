import type { TestCase } from "@content/_authoring/types";

export const functionName = "productValidationErrors";

export const tests: TestCase[] = [
  {
    "name": "returns no errors for valid input",
    "args": [
      {
        "name": "Alpha",
        "price": 10
      }
    ],
    "expected": []
  },
  {
    "name": "reports both validation errors",
    "args": [
      {
        "name": " ",
        "price": -1
      }
    ],
    "expected": [
      "name is required",
      "price cannot be negative"
    ]
  },
  {
    "name": "reports amount errors only",
    "args": [
      {
        "name": "Alpha",
        "price": -5
      }
    ],
    "expected": [
      "price cannot be negative"
    ],
    "hidden": true
  }
];
