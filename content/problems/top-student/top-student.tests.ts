import type { TestCase } from "@content/_authoring/types";

export const functionName = "topStudent";

export const tests: TestCase[] = [
  {
    "name": "returns the highest average",
    "args": [
      [
        {
          "name": "Ada",
          "scores": [
            90,
            95
          ]
        },
        {
          "name": "Grace",
          "scores": [
            100,
            70
          ]
        }
      ]
    ],
    "expected": "Ada"
  },
  {
    "name": "returns empty for no students",
    "args": [
      []
    ],
    "expected": ""
  },
  {
    "name": "keeps the first student on a tie",
    "args": [
      [
        {
          "name": "A",
          "scores": [
            80
          ]
        },
        {
          "name": "B",
          "scores": [
            80,
            80
          ]
        }
      ]
    ],
    "expected": "A",
    "hidden": true
  }
];
