import type { TestCase } from "@content/_authoring/types";

export const functionName = "sortBy";

const products = [
  { name: "Mug", price: 8 },
  { name: "Desk", price: 120 },
  { name: "Lamp", price: 35 },
];

export const tests: TestCase[] = [
  {
    name: "sorts numbers ascending",
    args: [products, "price", "asc"],
    expected: [
      { name: "Mug", price: 8 },
      { name: "Lamp", price: 35 },
      { name: "Desk", price: 120 },
    ],
  },
  {
    name: "sorts numbers descending",
    args: [products, "price", "desc"],
    expected: [
      { name: "Desk", price: 120 },
      { name: "Lamp", price: 35 },
      { name: "Mug", price: 8 },
    ],
  },
  {
    name: "sorts strings with localeCompare",
    args: [products, "name", "asc"],
    expected: [
      { name: "Desk", price: 120 },
      { name: "Lamp", price: 35 },
      { name: "Mug", price: 8 },
    ],
  },
  {
    name: "numbers compare numerically, not as text",
    args: [[{ n: 10 }, { n: 9 }, { n: 100 }], "n", "asc"],
    expected: [{ n: 9 }, { n: 10 }, { n: 100 }],
  },
  {
    name: "null values go last ascending",
    args: [[{ due: null }, { due: "2026-02-01" }, { due: "2026-01-01" }], "due", "asc"],
    expected: [{ due: "2026-01-01" }, { due: "2026-02-01" }, { due: null }],
  },
  {
    name: "null values also go last descending",
    args: [[{ due: null }, { due: "2026-01-01" }, { due: "2026-02-01" }], "due", "desc"],
    expected: [{ due: "2026-02-01" }, { due: "2026-01-01" }, { due: null }],
    hidden: true,
  },
  {
    name: "equal values keep their original order",
    args: [[{ id: "a", rank: 2 }, { id: "b", rank: 1 }, { id: "c", rank: 2 }], "rank", "desc"],
    expected: [{ id: "a", rank: 2 }, { id: "c", rank: 2 }, { id: "b", rank: 1 }],
    hidden: true,
  },
  {
    name: "missing properties go last too",
    args: [[{ id: "a" }, { id: "b", score: 3 }], "score", "asc"],
    expected: [{ id: "b", score: 3 }, { id: "a" }],
    hidden: true,
  },
];
