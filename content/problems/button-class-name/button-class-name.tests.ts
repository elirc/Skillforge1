import type { TestCase } from "@content/_authoring/types";

export const functionName = "buttonClassName";

export const tests: TestCase[] = [
  {
    "name": "builds primary class names",
    "args": [
      {
        "variant": "primary"
      }
    ],
    "expected": "btn btn-primary"
  },
  {
    "name": "builds secondary disabled class names",
    "args": [
      {
        "variant": "secondary",
        "disabled": true
      }
    ],
    "expected": "btn btn-secondary btn-disabled"
  },
  {
    "name": "does not add disabled when false",
    "args": [
      {
        "variant": "primary",
        "disabled": false
      }
    ],
    "expected": "btn btn-primary",
    "hidden": true
  }
];
