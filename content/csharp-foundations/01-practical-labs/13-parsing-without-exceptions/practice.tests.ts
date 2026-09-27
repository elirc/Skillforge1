export const functionName = "ParseQuantity";
export const tests = [
  {
    "name": "valid",
    "args": [
      "12"
    ],
    "expected": 12,
    "hidden": false
  },
  {
    "name": "not numeric",
    "args": [
      "many"
    ],
    "expected": 0,
    "hidden": false
  },
  {
    "name": "negative",
    "args": [
      "-2"
    ],
    "expected": 0,
    "hidden": true
  },
  {
    "name": "overflow",
    "args": [
      "99999999999999"
    ],
    "expected": 0,
    "hidden": true
  }
];
