import type { TestCase } from "@content/_authoring/types";

export const functionName = "temperatureJoinLabels";

export const tests: TestCase[] = [
  {
    "name": "joins labels with a separator",
    "args": [
      [
        "temperature",
        "daily",
        "ready"
      ],
      " / "
    ],
    "expected": "temperature / daily / ready"
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
