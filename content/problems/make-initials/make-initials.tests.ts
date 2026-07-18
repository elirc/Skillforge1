import type { TestCase } from "@content/_authoring/types";

export const functionName = "makeInitials";

export const tests: TestCase[] = [
  {
    "name": "builds two initials",
    "args": [
      "Ada Lovelace"
    ],
    "expected": "AL"
  },
  {
    "name": "handles extra spaces",
    "args": [
      "  grace   hopper  "
    ],
    "expected": "GH"
  },
  {
    "name": "handles one name",
    "args": [
      "prince"
    ],
    "expected": "P",
    "hidden": true
  }
];
