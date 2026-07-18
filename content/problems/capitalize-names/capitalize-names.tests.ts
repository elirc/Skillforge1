import type { TestCase } from "@content/_authoring/types";

export const functionName = "capitalizeNames";

export const tests: TestCase[] = [
  {
    "name": "capitalizes simple names",
    "args": [
      [
        "ada",
        "grace"
      ]
    ],
    "expected": [
      "Ada",
      "Grace"
    ]
  },
  {
    "name": "normalizes mixed case",
    "args": [
      [
        "ALAN",
        "maRgaret"
      ]
    ],
    "expected": [
      "Alan",
      "Margaret"
    ]
  },
  {
    "name": "keeps empty strings empty",
    "args": [
      [
        "",
        "linus"
      ]
    ],
    "expected": [
      "",
      "Linus"
    ],
    "hidden": true
  }
];
