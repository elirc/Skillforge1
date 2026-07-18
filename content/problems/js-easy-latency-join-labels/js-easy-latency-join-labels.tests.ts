import type { TestCase } from "@content/_authoring/types";

export const functionName = "latencyJoinLabels";

export const tests: TestCase[] = [
  {
    "name": "joins labels with a separator",
    "args": [
      [
        "latency",
        "daily",
        "ready"
      ],
      " / "
    ],
    "expected": "latency / daily / ready"
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
