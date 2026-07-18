import type { TestCase } from "@content/_authoring/types";

export const functionName = "toggleTodo";

export const tests: TestCase[] = [
  {
    "name": "toggles the matching todo",
    "args": [
      [
        {
          "id": "1",
          "text": "Ship",
          "completed": false
        },
        {
          "id": "2",
          "text": "Rest",
          "completed": true
        }
      ],
      "1"
    ],
    "expected": [
      {
        "id": "1",
        "text": "Ship",
        "completed": true
      },
      {
        "id": "2",
        "text": "Rest",
        "completed": true
      }
    ]
  },
  {
    "name": "leaves other todos alone",
    "args": [
      [
        {
          "id": "1",
          "text": "Ship",
          "completed": false
        }
      ],
      "missing"
    ],
    "expected": [
      {
        "id": "1",
        "text": "Ship",
        "completed": false
      }
    ]
  },
  {
    "name": "can toggle from true to false",
    "args": [
      [
        {
          "id": "a",
          "text": "Done",
          "completed": true
        }
      ],
      "a"
    ],
    "expected": [
      {
        "id": "a",
        "text": "Done",
        "completed": false
      }
    ],
    "hidden": true
  }
];
