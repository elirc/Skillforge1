export const functionName = "Quote";
export const tests = [
  {
    "name": "standard",
    "args": [
      20,
      false
    ],
    "expected": 25,
    "hidden": false
  },
  {
    "name": "express",
    "args": [
      20,
      true
    ],
    "expected": 32,
    "hidden": false
  },
  {
    "name": "zero subtotal",
    "args": [
      0,
      false
    ],
    "expected": 5,
    "hidden": true
  }
];
