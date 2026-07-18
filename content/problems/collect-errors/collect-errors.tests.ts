import type { TestCase } from "@content/_authoring/types";

export const functionName = "collectErrors";

export const tests: TestCase[] = [
  {
    "name": "collects failed row errors",
    "args": [
      [
        {
          "ok": true,
          "id": "1"
        },
        {
          "ok": false,
          "error": "Missing name"
        }
      ]
    ],
    "expected": [
      "Missing name"
    ]
  },
  {
    "name": "returns empty for all successful rows",
    "args": [
      [
        {
          "ok": true,
          "id": "1"
        }
      ]
    ],
    "expected": []
  },
  {
    "name": "preserves error order",
    "args": [
      [
        {
          "ok": false,
          "error": "A"
        },
        {
          "ok": false,
          "error": "B"
        }
      ]
    ],
    "expected": [
      "A",
      "B"
    ],
    "hidden": true
  }
];
