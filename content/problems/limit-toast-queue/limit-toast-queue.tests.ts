import type { TestCase } from "@content/_authoring/types";

export const functionName = "limitToastQueue";

export const tests: TestCase[] = [
  {
    "name": "appends when under the limit",
    "args": [
      [
        {
          "id": "1",
          "message": "One"
        }
      ],
      {
        "id": "2",
        "message": "Two"
      },
      3
    ],
    "expected": [
      {
        "id": "1",
        "message": "One"
      },
      {
        "id": "2",
        "message": "Two"
      }
    ]
  },
  {
    "name": "drops oldest over the limit",
    "args": [
      [
        {
          "id": "1",
          "message": "One"
        },
        {
          "id": "2",
          "message": "Two"
        }
      ],
      {
        "id": "3",
        "message": "Three"
      },
      2
    ],
    "expected": [
      {
        "id": "2",
        "message": "Two"
      },
      {
        "id": "3",
        "message": "Three"
      }
    ]
  },
  {
    "name": "supports a limit of one",
    "args": [
      [
        {
          "id": "1",
          "message": "One"
        }
      ],
      {
        "id": "2",
        "message": "Two"
      },
      1
    ],
    "expected": [
      {
        "id": "2",
        "message": "Two"
      }
    ],
    "hidden": true
  }
];
