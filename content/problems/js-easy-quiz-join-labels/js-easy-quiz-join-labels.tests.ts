import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizJoinLabels";

export const tests: TestCase[] = [
  {
    "name": "joins labels with a separator",
    "args": [
      [
        "quiz",
        "daily",
        "ready"
      ],
      " / "
    ],
    "expected": "quiz / daily / ready"
  },
  {
    "name": "handles one label",
    "args": [
      [
        "solo"
      ],
      ", "
    ],
    "expected": "solo"
  },
  {
    "name": "handles empty labels",
    "args": [
      [],
      ","
    ],
    "expected": "",
    "hidden": true
  }
];
