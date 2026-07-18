import type { TestCase } from "@content/_authoring/types";

export const functionName = "tabPanelId";

export const tests: TestCase[] = [
  {
    "name": "builds panel ids",
    "args": [
      "settings"
    ],
    "expected": "panel-settings"
  },
  {
    "name": "keeps numeric text",
    "args": [
      "2"
    ],
    "expected": "panel-2"
  },
  {
    "name": "keeps existing dashes",
    "args": [
      "user-profile"
    ],
    "expected": "panel-user-profile",
    "hidden": true
  }
];
