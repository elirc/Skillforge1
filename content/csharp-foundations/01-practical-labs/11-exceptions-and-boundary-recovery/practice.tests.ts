export const functionName = "ReadQuantity";
export const tests = [
  {
    "name": "valid",
    "args": [
      "12"
    ],
    "expected": "ok:12",
    "hidden": false
  },
  {
    "name": "malformed",
    "args": [
      "many"
    ],
    "expected": "invalid-format",
    "hidden": false
  },
  {
    "name": "overflow",
    "args": [
      "999999999999999"
    ],
    "expected": "out-of-range",
    "hidden": true
  }
];
