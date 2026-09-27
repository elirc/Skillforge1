import type { TestCase } from "@content/_authoring/types";

export const functionName = "runningTotals";

export const tests: TestCase[] = [
  {
    name: "running total and row number within one customer",
    args: [
      [
        { id: 1, customerId: 7, paidAt: "2026-01-01", amount: 10 },
        { id: 2, customerId: 7, paidAt: "2026-01-05", amount: 15 },
        { id: 3, customerId: 7, paidAt: "2026-02-01", amount: 5 },
      ],
    ],
    expected: [
      { id: 1, customerId: 7, runningTotal: 10, paymentNumber: 1 },
      { id: 2, customerId: 7, runningTotal: 25, paymentNumber: 2 },
      { id: 3, customerId: 7, runningTotal: 30, paymentNumber: 3 },
    ],
  },
  {
    name: "each customer is its own partition and rows are sorted first",
    args: [
      [
        { id: 4, customerId: 2, paidAt: "2026-03-02", amount: 40 },
        { id: 5, customerId: 1, paidAt: "2026-03-05", amount: 8 },
        { id: 6, customerId: 2, paidAt: "2026-03-01", amount: 60 },
        { id: 7, customerId: 1, paidAt: "2026-03-01", amount: 2 },
      ],
    ],
    expected: [
      { id: 7, customerId: 1, runningTotal: 2, paymentNumber: 1 },
      { id: 5, customerId: 1, runningTotal: 10, paymentNumber: 2 },
      { id: 6, customerId: 2, runningTotal: 60, paymentNumber: 1 },
      { id: 4, customerId: 2, runningTotal: 100, paymentNumber: 2 },
    ],
  },
  {
    name: "equal timestamps are ordered by id (ROWS framing, not RANGE)",
    args: [
      [
        { id: 9, customerId: 3, paidAt: "2026-04-01", amount: 1 },
        { id: 8, customerId: 3, paidAt: "2026-04-01", amount: 2 },
      ],
    ],
    expected: [
      { id: 8, customerId: 3, runningTotal: 2, paymentNumber: 1 },
      { id: 9, customerId: 3, runningTotal: 3, paymentNumber: 2 },
    ],
    hidden: true,
  },
  { name: "no payments returns no rows", args: [[]], expected: [], hidden: true },
];
