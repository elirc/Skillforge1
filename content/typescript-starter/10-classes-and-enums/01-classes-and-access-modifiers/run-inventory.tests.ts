import type { TestCase } from "@content/_authoring/types";

export const functionName = "runInventory";

export const tests: TestCase[] = [
  {
    name: "adds accumulate per SKU",
    args: [[{ op: "add", sku: "pen", qty: 3 }, { op: "add", sku: "pen", qty: 2 }, { op: "count", sku: "pen" }]],
    expected: { results: [3, 5, 5], skus: 1 },
  },
  {
    name: "removing within stock lowers the count",
    args: [[{ op: "add", sku: "pen", qty: 5 }, { op: "remove", sku: "pen", qty: 2 }]],
    expected: { results: [5, 3], skus: 1 },
  },
  {
    name: "overdraft is rejected and stock is unchanged",
    args: [[{ op: "add", sku: "pen", qty: 2 }, { op: "remove", sku: "pen", qty: 5 }, { op: "count", sku: "pen" }]],
    expected: { results: [2, "only 2 pen in stock", 2], skus: 1 },
  },
  {
    name: "quantities must be positive integers",
    args: [[{ op: "add", sku: "pen", qty: 0 }, { op: "add", sku: "pen", qty: 1.5 }, { op: "remove", sku: "pen", qty: -1 }]],
    expected: { results: ["qty must be a positive integer", "qty must be a positive integer", "qty must be a positive integer"], skus: 0 },
  },
  {
    name: "a SKU that reaches zero is no longer stocked",
    args: [[{ op: "add", sku: "a", qty: 1 }, { op: "add", sku: "b", qty: 1 }, { op: "remove", sku: "a", qty: 1 }]],
    expected: { results: [1, 1, 0], skus: 1 },
  },
  {
    name: "counting an unknown SKU returns 0",
    args: [[{ op: "count", sku: "ghost" }]],
    expected: { results: [0], skus: 0 },
  },
  {
    name: "removing an unknown SKU reports zero stock",
    args: [[{ op: "remove", sku: "ghost", qty: 1 }]],
    expected: { results: ["only 0 ghost in stock"], skus: 0 },
    hidden: true,
  },
  {
    name: "a failed add does not create the SKU",
    args: [[{ op: "add", sku: "x", qty: -3 }, { op: "count", sku: "x" }]],
    expected: { results: ["qty must be a positive integer", 0], skus: 0 },
    hidden: true,
  },
];
