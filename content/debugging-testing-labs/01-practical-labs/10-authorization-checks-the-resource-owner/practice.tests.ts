export const functionName = "canEdit";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      "alice",
      "bob"
    ],
    "expected": false,
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      "alice",
      "alice"
    ],
    "expected": true,
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      null,
      "bob"
    ],
    "expected": false,
    "hidden": true
  }
];
