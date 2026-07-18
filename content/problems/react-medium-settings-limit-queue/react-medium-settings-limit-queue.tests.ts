import type { TestCase } from "@content/_authoring/types";

export const functionName = "settingsLimitQueue";

export const tests: TestCase[] = [
  {
    "name": "appends under the limit",
    "args": [
      [
        {
          "id": "1",
          "text": "One"
        }
      ],
      {
        "id": "2",
        "text": "Two"
      },
      3
    ],
    "expected": [
      {
        "id": "1",
        "text": "One"
      },
      {
        "id": "2",
        "text": "Two"
      }
    ]
  },
  {
    "name": "drops the oldest item",
    "args": [
      [
        {
          "id": "1",
          "text": "One"
        },
        {
          "id": "2",
          "text": "Two"
        }
      ],
      {
        "id": "3",
        "text": "Three"
      },
      2
    ],
    "expected": [
      {
        "id": "2",
        "text": "Two"
      },
      {
        "id": "3",
        "text": "Three"
      }
    ]
  },
  {
    "name": "supports a limit of one",
    "args": [
      [
        {
          "id": "1",
          "text": "One"
        }
      ],
      {
        "id": "2",
        "text": "Two"
      },
      1
    ],
    "expected": [
      {
        "id": "2",
        "text": "Two"
      }
    ],
    "hidden": true
  }
];
