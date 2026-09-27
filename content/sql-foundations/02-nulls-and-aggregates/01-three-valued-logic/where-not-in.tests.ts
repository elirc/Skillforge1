import type { TestCase } from "@content/_authoring/types";

export const functionName = "whereNotIn";

const orders = [
  { id: 10, customerId: 1 },
  { id: 11, customerId: 2 },
  { id: 12, customerId: 3 },
  { id: 13, customerId: null },
];

export const tests: TestCase[] = [
  { name: "drops orders from blocked customers", args: [[orders[0], orders[1], orders[2]], [2]], expected: [10, 12] },
  { name: "an order with a NULL customer_id is never kept", args: [orders, [2]], expected: [10, 12] },
  { name: "a NULL inside the list makes NOT IN return nothing", args: [orders, [2, null]], expected: [] },
  { name: "an empty subquery keeps every row, even the NULL one", args: [orders, []], expected: [10, 11, 12, 13], hidden: true },
  { name: "blocking every customer leaves nothing", args: [orders, [1, 2, 3]], expected: [], hidden: true },
  { name: "a list of only NULL also returns nothing", args: [orders, [null]], expected: [], hidden: true },
];
