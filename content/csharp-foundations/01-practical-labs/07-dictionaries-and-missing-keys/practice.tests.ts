export const functionName = "CountSku";
export const tests = [
  {
    "name": "repeated SKU",
    "args": [
      [
        "A",
        "B",
        "A"
      ],
      "A"
    ],
    "expected": 2,
    "hidden": false
  },
  {
    "name": "missing",
    "args": [
      [
        "A"
      ],
      "Z"
    ],
    "expected": 0,
    "hidden": false
  },
  {
    "name": "case sensitive",
    "args": [
      [
        "a",
        "A"
      ],
      "A"
    ],
    "expected": 1,
    "hidden": true
  }
];
