import type { TestCase } from "@content/_authoring/types";

export const functionName = "workspaceFallbackName";

export const tests: TestCase[] = [
  {
    "name": "uses display name",
    "args": [
      {
        "displayName": "Custom",
        "fallbackName": "Fallback"
      }
    ],
    "expected": "Custom"
  },
  {
    "name": "uses fallback name",
    "args": [
      {
        "fallbackName": "Fallback"
      }
    ],
    "expected": "Fallback"
  },
  {
    "name": "keeps empty display names",
    "args": [
      {
        "displayName": "",
        "fallbackName": "Fallback"
      }
    ],
    "expected": "",
    "hidden": true
  }
];
