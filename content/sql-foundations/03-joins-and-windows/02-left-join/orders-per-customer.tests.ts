import type { TestCase } from "@content/_authoring/types";

export const functionName = "ordersPerCustomer";

export const tests: TestCase[] = [
  {
    name: "counts orders and sums totals per customer",
    args: [
      [
        { id: 1, name: "Ada" },
        { id: 2, name: "Bo" },
      ],
      [
        { id: 10, customerId: 1, total: 20 },
        { id: 11, customerId: 1, total: 5 },
        { id: 12, customerId: 2, total: 40 },
      ],
    ],
    expected: [
      { id: 1, name: "Ada", orderCount: 2, totalSpent: 25 },
      { id: 2, name: "Bo", orderCount: 1, totalSpent: 40 },
    ],
  },
  {
    name: "a customer with no orders appears with 0 and 0",
    args: [
      [
        { id: 3, name: "Cy" },
        { id: 1, name: "Ada" },
      ],
      [{ id: 10, customerId: 1, total: 20 }],
    ],
    expected: [
      { id: 1, name: "Ada", orderCount: 1, totalSpent: 20 },
      { id: 3, name: "Cy", orderCount: 0, totalSpent: 0 },
    ],
  },
  {
    name: "orphaned orders do not attach to any customer",
    args: [
      [{ id: 1, name: "Ada" }],
      [
        { id: 10, customerId: null, total: 20 },
        { id: 11, customerId: 7, total: 30 },
      ],
    ],
    expected: [{ id: 1, name: "Ada", orderCount: 0, totalSpent: 0 }],
    hidden: true,
  },
  { name: "no customers returns no rows", args: [[], [{ id: 1, customerId: 1, total: 5 }]], expected: [], hidden: true },
];
