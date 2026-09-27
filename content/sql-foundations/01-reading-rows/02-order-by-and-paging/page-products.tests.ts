import type { TestCase } from "@content/_authoring/types";

export const functionName = "pageProducts";

const products = [
  { id: 5, name: "Lamp", price: 20 },
  { id: 1, name: "Desk", price: 150 },
  { id: 7, name: "Mug", price: 8 },
  { id: 3, name: "Chair", price: 20 },
  { id: 2, name: "Shelf", price: 75 },
  { id: 6, name: "Pen", price: 20 },
];

export const tests: TestCase[] = [
  { name: "page 1 is the most expensive rows", args: [products, 1, 2], expected: [1, 2] },
  { name: "ties on price are broken by id ascending", args: [products, 2, 2], expected: [3, 5] },
  { name: "the last page can be partial", args: [products, 2, 4], expected: [6, 7], hidden: true },
  { name: "a page past the end is empty", args: [products, 4, 2], expected: [], hidden: true },
  { name: "one big page returns everything in order", args: [products, 1, 10], expected: [1, 2, 3, 5, 6, 7], hidden: true },
];
