export const functionName = "NormalizeSku";
export const tests = [
  {
    "name": "surrounding whitespace",
    "args": [
      " ab-12 "
    ],
    "expected": "AB-12",
    "hidden": false
  },
  {
    "name": "already canonical",
    "args": [
      "SKU-1"
    ],
    "expected": "SKU-1",
    "hidden": false
  },
  {
    "name": "internal separator",
    "args": [
      " a b "
    ],
    "expected": "A B",
    "hidden": true
  }
];
