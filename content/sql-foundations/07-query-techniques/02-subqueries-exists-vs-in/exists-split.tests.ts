import type { TestCase } from "@content/_authoring/types";

export const functionName = "existsSplit";

const customers = [
  { id: 1, name: "Cara" },
  { id: 2, name: "Abe" },
  { id: 3, name: "Bo" },
];

export const tests: TestCase[] = [
  {
    name: "splits customers into EXISTS and NOT EXISTS, sorted by name",
    args: [customers, [{ id: 10, customerId: 1, status: "paid" }]],
    expected: { withPaidOrders: ["Cara"], withoutPaidOrders: ["Abe", "Bo"] },
  },
  {
    name: "many matching orders still list the customer once (no join fan-out)",
    args: [
      customers,
      [
        { id: 10, customerId: 2, status: "paid" },
        { id: 11, customerId: 2, status: "paid" },
        { id: 12, customerId: 2, status: "paid" },
      ],
    ],
    expected: { withPaidOrders: ["Abe"], withoutPaidOrders: ["Bo", "Cara"] },
  },
  {
    name: "only paid orders satisfy the correlated condition",
    args: [
      customers,
      [
        { id: 10, customerId: 1, status: "cancelled" },
        { id: 11, customerId: 3, status: "paid" },
      ],
    ],
    expected: { withPaidOrders: ["Bo"], withoutPaidOrders: ["Abe", "Cara"] },
  },
  {
    name: "a NULL customer_id does not wipe out the anti-join (unlike NOT IN)",
    args: [
      customers,
      [
        { id: 10, customerId: null, status: "paid" },
        { id: 11, customerId: 1, status: "paid" },
      ],
    ],
    expected: { withPaidOrders: ["Cara"], withoutPaidOrders: ["Abe", "Bo"] },
  },
  {
    name: "no orders at all: everyone lands in NOT EXISTS",
    args: [customers, []],
    expected: { withPaidOrders: [], withoutPaidOrders: ["Abe", "Bo", "Cara"] },
  },
  {
    name: "orders for unknown customers are ignored",
    args: [customers, [{ id: 10, customerId: 42, status: "paid" }]],
    expected: { withPaidOrders: [], withoutPaidOrders: ["Abe", "Bo", "Cara"] },
    hidden: true,
  },
  {
    name: "everyone matches",
    args: [
      [
        { id: 2, name: "Zed" },
        { id: 1, name: "Amy" },
      ],
      [
        { id: 1, customerId: 2, status: "paid" },
        { id: 2, customerId: 1, status: "paid" },
      ],
    ],
    expected: { withPaidOrders: ["Amy", "Zed"], withoutPaidOrders: [] },
    hidden: true,
  },
];
