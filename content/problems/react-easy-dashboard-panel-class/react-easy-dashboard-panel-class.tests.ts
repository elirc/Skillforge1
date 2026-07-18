import type { TestCase } from "@content/_authoring/types";

export const functionName = "dashboardPanelClass";

export const tests: TestCase[] = [
  {
    "name": "returns base class",
    "args": [
      {}
    ],
    "expected": "panel"
  },
  {
    "name": "adds selected and disabled classes",
    "args": [
      {
        "selected": true,
        "disabled": true
      }
    ],
    "expected": "panel selected disabled"
  },
  {
    "name": "adds disabled only",
    "args": [
      {
        "disabled": true
      }
    ],
    "expected": "panel disabled",
    "hidden": true
  }
];
