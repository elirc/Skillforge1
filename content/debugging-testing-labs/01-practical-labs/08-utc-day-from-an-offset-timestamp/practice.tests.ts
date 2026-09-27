export const functionName = "utcDay";
export const tests = [
  {
    "name": "reported defect",
    "args": [
      "2026-01-01T23:30:00-02:00"
    ],
    "expected": "2026-01-02",
    "hidden": false
  },
  {
    "name": "contract boundary 2",
    "args": [
      "2026-01-01T10:00:00Z"
    ],
    "expected": "2026-01-01",
    "hidden": false
  },
  {
    "name": "contract boundary 3",
    "args": [
      "2026-01-01T00:30:00+02:00"
    ],
    "expected": "2025-12-31",
    "hidden": true
  }
];
