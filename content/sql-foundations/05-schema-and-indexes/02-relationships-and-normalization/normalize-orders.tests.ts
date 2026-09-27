import type { TestCase } from "@content/_authoring/types";

export const functionName = "normalizeOrders";

export const tests: TestCase[] = [
  {
    name: "splits repeated customer facts into their own table",
    args: [
      [
        { orderId: 100, orderTotal: 20, customerEmail: "ada@x.io", customerName: "Ada" },
        { orderId: 101, orderTotal: 35, customerEmail: "bo@x.io", customerName: "Bo" },
        { orderId: 102, orderTotal: 15, customerEmail: "ada@x.io", customerName: "Ada" },
      ],
    ],
    expected: {
      customers: [
        { id: 1, email: "ada@x.io", name: "Ada" },
        { id: 2, email: "bo@x.io", name: "Bo" },
      ],
      orders: [
        { id: 100, customerId: 1, total: 20 },
        { id: 101, customerId: 2, total: 35 },
        { id: 102, customerId: 1, total: 15 },
      ],
    },
  },
  {
    name: "the first name seen for an email wins (the update anomaly, resolved)",
    args: [
      [
        { orderId: 7, orderTotal: 5, customerEmail: "cy@x.io", customerName: "Cy" },
        { orderId: 8, orderTotal: 6, customerEmail: "cy@x.io", customerName: "Cyrus" },
      ],
    ],
    expected: {
      customers: [{ id: 1, email: "cy@x.io", name: "Cy" }],
      orders: [
        { id: 7, customerId: 1, total: 5 },
        { id: 8, customerId: 1, total: 6 },
      ],
    },
    hidden: true,
  },
  { name: "an empty export produces empty tables", args: [[]], expected: { customers: [], orders: [] }, hidden: true },
];
