import type { TestCase } from "@content/_authoring/types";

export const functionName = "fewestVouchers";

export const tests: TestCase[] = [
  { name: "canonical denominations", args: [[1, 5, 10, 25], 30], expected: { count: 2, vouchers: [25, 5] } },
  { name: "greedy would use three vouchers", args: [[1, 3, 4], 6], expected: { count: 2, vouchers: [3, 3] } },
  { name: "impossible amounts return null", args: [[5, 10], 3], expected: null },
  { name: "zero needs no vouchers", args: [[7], 0], expected: { count: 0, vouchers: [] } },
  { name: "mixes denominations", args: [[2, 5], 11], expected: { count: 4, vouchers: [5, 2, 2, 2] } },
  { name: "greedy 25 first is worse", args: [[1, 15, 25], 30], expected: { count: 2, vouchers: [15, 15] } },
  { name: "denominations may be unsorted", args: [[4, 1, 3], 6], expected: { count: 2, vouchers: [3, 3] }, hidden: true },
  { name: "43 cannot be made from 6, 9 and 20", args: [[6, 9, 20], 43], expected: null, hidden: true },
  { name: "44 from 6, 9 and 20", args: [[6, 9, 20], 44], expected: { count: 4, vouchers: [20, 9, 9, 6] }, hidden: true },
];
