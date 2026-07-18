import type { TestCase } from "@content/_authoring/types";

export const functionName = "quizCountAtLeast";

export const tests: TestCase[] = [
  {
    "name": "counts values at or above minimum",
    "args": [
      [
        72,
        88,
        91,
        64
      ],
      80
    ],
    "expected": 2
  },
  {
    "name": "returns zero when none qualify",
    "args": [
      [
        48,
        49
      ],
      80
    ],
    "expected": 0
  },
  {
    "name": "counts values equal to minimum",
    "args": [
      [
        80,
        79,
        81
      ],
      80
    ],
    "expected": 2,
    "hidden": true
  }
];
