export const functionName = "DisplayName";
export const tests = [
  {
    "name": "named",
    "args": [
      " Ada "
    ],
    "expected": "Ada",
    "hidden": false
  },
  {
    "name": "missing",
    "args": [
      null
    ],
    "expected": "Guest",
    "hidden": false
  },
  {
    "name": "blank",
    "args": [
      "   "
    ],
    "expected": "Guest",
    "hidden": true
  }
];
