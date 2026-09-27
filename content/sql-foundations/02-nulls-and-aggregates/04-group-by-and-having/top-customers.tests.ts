import type { TestCase } from "@content/_authoring/types";

export const functionName = "topCustomers";

const orders = [
  { id: 1, customerId: 1, status: "paid", total: 50 },
  { id: 2, customerId: 2, status: "paid", total: 200 },
  { id: 3, customerId: 1, status: "shipped", total: 70 },
  { id: 4, customerId: 2, status: "cancelled", total: 500 },
  { id: 5, customerId: 3, status: "paid", total: 40 },
  { id: 6, customerId: 3, status: "paid", total: 80 },
  { id: 7, customerId: 1, status: null, total: 999 },
];

export const tests: TestCase[] = [
  {
    name: "groups, filters with HAVING, and sorts by revenue then id",
    args: [orders, 2],
    expected: [
      { customerId: 1, orderCount: 2, revenue: 120 },
      { customerId: 3, orderCount: 2, revenue: 120 },
    ],
  },
  {
    name: "cancelled and NULL-status orders are removed before grouping",
    args: [orders, 1],
    expected: [
      { customerId: 2, orderCount: 1, revenue: 200 },
      { customerId: 1, orderCount: 2, revenue: 120 },
      { customerId: 3, orderCount: 2, revenue: 120 },
    ],
  },
  {
    name: "NULL customer ids form a single group",
    args: [
      [
        { id: 1, customerId: null, status: "paid", total: 10 },
        { id: 2, customerId: null, status: "paid", total: 15 },
        { id: 3, customerId: 4, status: "paid", total: 5 },
      ],
      2,
    ],
    expected: [{ customerId: null, orderCount: 2, revenue: 25 }],
    hidden: true,
  },
  { name: "no group meets the HAVING threshold", args: [orders, 3], expected: [], hidden: true },
];
