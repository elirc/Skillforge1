import type { TestCase } from "@content/_authoring/types";

export const functionName = "inventoryJoinLabels";

export const tests: TestCase[] = [
  {
    "name": "joins labels with a separator",
    "args": [
      [
        "inventory",
        "daily",
        "ready"
      ],
      " / "
    ],
    "expected": "inventory / daily / ready"
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
