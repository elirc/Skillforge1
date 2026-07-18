import type { TestCase } from "@content/_authoring/types";

export const functionName = "workoutJoinLabels";

export const tests: TestCase[] = [
  {
    "name": "joins labels with a separator",
    "args": [
      [
        "workout",
        "daily",
        "ready"
      ],
      " / "
    ],
    "expected": "workout / daily / ready"
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
