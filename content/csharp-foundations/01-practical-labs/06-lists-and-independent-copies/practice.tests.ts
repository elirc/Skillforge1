export const functionName = "AppendCopy";
export const tests = [
  {
    "name": "append",
    "args": [
      [
        1,
        2
      ],
      3
    ],
    "expected": [
      1,
      2,
      3
    ],
    "hidden": false
  },
  {
    "name": "empty",
    "args": [
      [],
      4
    ],
    "expected": [
      4
    ],
    "hidden": false
  },
  {
    "name": "keep duplicates",
    "args": [
      [
        2
      ],
      2
    ],
    "expected": [
      2,
      2
    ],
    "hidden": true
  }
];
