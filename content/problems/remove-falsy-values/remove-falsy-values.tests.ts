import type { TestCase } from "@content/_authoring/types";

export const functionName = "removeFalsyValues";

export const tests: TestCase[] = [
  {
    "name": "removes common falsy values",
    "args": [
      [
        0,
        1,
        false,
        true,
        "",
        "hi",
        null
      ]
    ],
    "expected": [
      1,
      true,
      "hi"
    ]
  },
  {
    "name": "keeps truthy objects and arrays",
    "args": [
      [
        [],
        {},
        "ok"
      ]
    ],
    "expected": [
      [],
      {},
      "ok"
    ]
  },
  {
    "name": "handles undefined values",
    "args": [
      [
        null,
        "ready",
        2
      ]
    ],
    "expected": [
      "ready",
      2
    ],
    "hidden": true
  }
];
