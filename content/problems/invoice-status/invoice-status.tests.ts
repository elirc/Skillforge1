import type { TestCase } from "@content/_authoring/types";

export const functionName = "invoiceStatus";

export const tests: TestCase[] = [
  {
    "name": "returns paid first",
    "args": [
      {
        "dueDate": "2026-01-01",
        "paid": true
      },
      "2026-02-01"
    ],
    "expected": "paid"
  },
  {
    "name": "detects overdue invoices",
    "args": [
      {
        "dueDate": "2026-01-01",
        "paid": false
      },
      "2026-02-01"
    ],
    "expected": "overdue"
  },
  {
    "name": "keeps future invoices open",
    "args": [
      {
        "dueDate": "2026-03-01",
        "paid": false
      },
      "2026-02-01"
    ],
    "expected": "open",
    "hidden": true
  }
];
