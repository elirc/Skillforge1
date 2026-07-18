import type { TestCase } from "@content/_authoring/types";

export const functionName = "activeNavClass";

export const tests: TestCase[] = [
  {
    "name": "marks active links",
    "args": [
      "/problems",
      "/problems"
    ],
    "expected": "nav-item active"
  },
  {
    "name": "leaves inactive links plain",
    "args": [
      "/courses",
      "/problems"
    ],
    "expected": "nav-item"
  },
  {
    "name": "requires exact matches",
    "args": [
      "/courses",
      "/courses/js"
    ],
    "expected": "nav-item",
    "hidden": true
  }
];
