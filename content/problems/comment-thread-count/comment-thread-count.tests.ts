import type { TestCase } from "@content/_authoring/types";

export const functionName = "commentThreadCount";

export const tests: TestCase[] = [
  {
    "name": "counts nested replies",
    "args": [
      [
        {
          "id": "1",
          "replies": [
            {
              "id": "1a"
            },
            {
              "id": "1b"
            }
          ]
        },
        {
          "id": "2"
        }
      ]
    ],
    "expected": 4
  },
  {
    "name": "handles no comments",
    "args": [
      []
    ],
    "expected": 0
  },
  {
    "name": "counts deeper replies",
    "args": [
      [
        {
          "id": "1",
          "replies": [
            {
              "id": "2",
              "replies": [
                {
                  "id": "3"
                }
              ]
            }
          ]
        }
      ]
    ],
    "expected": 3,
    "hidden": true
  }
];
