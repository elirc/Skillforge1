import type { TestCase } from "@content/_authoring/types";

export const functionName = "pivotStatuses";

export const tests: TestCase[] = [
  {
    name: "one row per customer with a column per status",
    args: [
      [
        { customerId: 1, status: "paid", amount: 30 },
        { customerId: 1, status: "refunded", amount: 5 },
        { customerId: 1, status: "pending", amount: 12 },
        { customerId: 1, status: "paid", amount: 20 },
      ],
    ],
    expected: [{ customerId: 1, paidTotal: 50, refundedTotal: 5, pendingCount: 1 }],
  },
  {
    name: "groups are sorted by customerId",
    args: [
      [
        { customerId: 9, status: "paid", amount: 10 },
        { customerId: 2, status: "paid", amount: 4 },
      ],
    ],
    expected: [
      { customerId: 2, paidTotal: 4, refundedTotal: 0, pendingCount: 0 },
      { customerId: 9, paidTotal: 10, refundedTotal: 0, pendingCount: 0 },
    ],
  },
  {
    name: "ELSE 0 gives 0 rather than NULL for a customer with no paid orders",
    args: [[{ customerId: 3, status: "pending", amount: 99 }]],
    expected: [{ customerId: 3, paidTotal: 0, refundedTotal: 0, pendingCount: 1 }],
  },
  {
    name: "COUNT(CASE ...) counts rows, it does not sum amounts",
    args: [
      [
        { customerId: 4, status: "pending", amount: 100 },
        { customerId: 4, status: "pending", amount: 200 },
      ],
    ],
    expected: [{ customerId: 4, paidTotal: 0, refundedTotal: 0, pendingCount: 2 }],
  },
  {
    name: "other statuses still create the group but add to no column",
    args: [[{ customerId: 5, status: "cancelled", amount: 40 }]],
    expected: [{ customerId: 5, paidTotal: 0, refundedTotal: 0, pendingCount: 0 }],
  },
  { name: "no orders, no groups", args: [[]], expected: [], hidden: true },
  {
    name: "status comparison is exact, like a case-sensitive collation",
    args: [
      [
        { customerId: 6, status: "PAID", amount: 10 },
        { customerId: 6, status: "paid", amount: 1 },
      ],
    ],
    expected: [{ customerId: 6, paidTotal: 1, refundedTotal: 0, pendingCount: 0 }],
    hidden: true,
  },
];
