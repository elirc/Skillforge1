import type { TestCase } from "@content/_authoring/types";

export const functionName = "importRows";

export const tests: TestCase[] = [
  {
    name: "valid rows are imported with a rounded total",
    args: [[{ id: "a", qty: 3, price: 1.1 }, { id: "b", qty: 1, price: 20 }]],
    expected: {
      imported: 2,
      failed: 0,
      results: [
        { ok: true, id: "a", total: 3.3 },
        { ok: true, id: "b", total: 20 },
      ],
    },
  },
  {
    name: "a bad quantity becomes a failed result and the batch continues",
    args: [[{ id: "a", qty: 0, price: 5 }, { id: "b", qty: 2, price: 5 }]],
    expected: {
      imported: 1,
      failed: 1,
      results: [
        { ok: false, id: "a", field: "qty", message: "qty must be a positive integer" },
        { ok: true, id: "b", total: 10 },
      ],
    },
  },
  {
    name: "fractional and string quantities are rejected",
    args: [[{ id: "a", qty: 1.5, price: 2 }, { id: "b", qty: "2", price: 2 }]],
    expected: {
      imported: 0,
      failed: 2,
      results: [
        { ok: false, id: "a", field: "qty", message: "qty must be a positive integer" },
        { ok: false, id: "b", field: "qty", message: "qty must be a positive integer" },
      ],
    },
  },
  {
    name: "a negative or missing price fails on the price field",
    args: [[{ id: "a", qty: 1, price: -1 }, { id: "b", qty: 1, price: null }]],
    expected: {
      imported: 0,
      failed: 2,
      results: [
        { ok: false, id: "a", field: "price", message: "price must be a non-negative number" },
        { ok: false, id: "b", field: "price", message: "price must be a non-negative number" },
      ],
    },
  },
  {
    name: "a free item (price 0) is valid",
    args: [[{ id: "gift", qty: 2, price: 0 }]],
    expected: { imported: 1, failed: 0, results: [{ ok: true, id: "gift", total: 0 }] },
  },
  {
    name: "an empty batch imports nothing",
    args: [[]],
    expected: { imported: 0, failed: 0, results: [] },
  },
  {
    name: "quantity is checked before price",
    args: [[{ id: "x", qty: -2, price: -2 }]],
    expected: {
      imported: 0,
      failed: 1,
      results: [{ ok: false, id: "x", field: "qty", message: "qty must be a positive integer" }],
    },
    hidden: true,
  },
  {
    name: "a numeric string is not a valid price",
    args: [[{ id: "x", qty: 1, price: "5" }]],
    expected: {
      imported: 0,
      failed: 1,
      results: [{ ok: false, id: "x", field: "price", message: "price must be a non-negative number" }],
    },
    hidden: true,
  },
];
