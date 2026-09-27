import type { TestCase } from "@content/_authoring/types";

export const functionName = "innerJoinOrders";

const customers = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Bo" },
  { id: 3, name: "Cy" },
];

export const tests: TestCase[] = [
  {
    name: "one row per matching order, ordered by order id",
    args: [
      customers,
      [
        { id: 12, customerId: 2, total: 30 },
        { id: 10, customerId: 1, total: 15 },
        { id: 11, customerId: 1, total: 25 },
      ],
    ],
    expected: [
      { name: "Ada", orderId: 10, total: 15 },
      { name: "Ada", orderId: 11, total: 25 },
      { name: "Bo", orderId: 12, total: 30 },
    ],
  },
  {
    name: "orders with a NULL or dangling customer id are dropped",
    args: [
      customers,
      [
        { id: 20, customerId: null, total: 5 },
        { id: 21, customerId: 99, total: 6 },
        { id: 22, customerId: 3, total: 7 },
      ],
    ],
    expected: [{ name: "Cy", orderId: 22, total: 7 }],
  },
  { name: "no orders means no rows", args: [customers, []], expected: [], hidden: true },
  {
    name: "no customers means no rows",
    args: [[], [{ id: 1, customerId: 1, total: 9 }]],
    expected: [],
    hidden: true,
  },
];
