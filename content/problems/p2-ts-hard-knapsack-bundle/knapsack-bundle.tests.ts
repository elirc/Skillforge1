import type { TestCase } from "@content/_authoring/types";

export const functionName = "bestBundle";

const addon = (id: string, price: number, value: number) => ({ id, price, value });

export const tests: TestCase[] = [
  {
    name: "two cheap add-ons beat one pricier one",
    args: [[addon("a", 3, 4), addon("b", 4, 5), addon("c", 2, 3)], 5],
    expected: { value: 7, price: 5, ids: ["a", "c"] },
  },
  { name: "a zero budget buys nothing", args: [[addon("a", 1, 9)], 0], expected: { value: 0, price: 0, ids: [] } },
  {
    name: "best value per dollar is not optimal",
    args: [[addon("i1", 10, 60), addon("i2", 20, 100), addon("i3", 30, 120)], 50],
    expected: { value: 220, price: 50, ids: ["i2", "i3"] },
  },
  {
    name: "equal value prefers the lower price",
    args: [[addon("a", 5, 10), addon("b", 3, 10)], 5],
    expected: { value: 10, price: 3, ids: ["b"] },
  },
  {
    name: "everything fits",
    args: [[addon("b", 1, 2), addon("a", 1, 1)], 10],
    expected: { value: 3, price: 2, ids: ["a", "b"] },
  },
  { name: "nothing is affordable", args: [[addon("a", 9, 5)], 3], expected: { value: 0, price: 0, ids: [] } },
  {
    name: "zero-value add-ons are not included",
    args: [[addon("a", 1, 0), addon("b", 2, 5)], 3],
    expected: { value: 5, price: 2, ids: ["b"] },
    hidden: true,
  },
  {
    name: "five add-ons, budget eight",
    args: [[addon("m1", 4, 7), addon("m2", 3, 5), addon("m3", 2, 3), addon("m4", 5, 9), addon("m5", 1, 1)], 8],
    expected: { value: 14, price: 8, ids: ["m2", "m4"] },
    hidden: true,
  },
];
