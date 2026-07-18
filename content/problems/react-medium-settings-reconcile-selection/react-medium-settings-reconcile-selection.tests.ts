import type { TestCase } from "@content/_authoring/types";

export const functionName = "settingsReconcileSelection";

export const tests: TestCase[] = [
  {
    "name": "keeps visible selections",
    "args": [
      [
        "a",
        "b",
        "c"
      ],
      [
        {
          "id": "a"
        },
        {
          "id": "c"
        }
      ]
    ],
    "expected": [
      "a",
      "c"
    ]
  },
  {
    "name": "removes missing ids",
    "args": [
      [
        "x"
      ],
      [
        {
          "id": "a"
        }
      ]
    ],
    "expected": []
  },
  {
    "name": "preserves selected order",
    "args": [
      [
        "c",
        "a"
      ],
      [
        {
          "id": "a"
        },
        {
          "id": "c"
        }
      ]
    ],
    "expected": [
      "c",
      "a"
    ],
    "hidden": true
  }
];
