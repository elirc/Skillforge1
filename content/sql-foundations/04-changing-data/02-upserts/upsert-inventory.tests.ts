import type { TestCase } from "@content/_authoring/types";

export const functionName = "upsertInventory";

export const tests: TestCase[] = [
  {
    name: "updates existing skus and inserts new ones",
    args: [
      [
        { sku: "MUG-01", qty: 10 },
        { sku: "PEN-02", qty: 3 },
      ],
      [
        { sku: "PEN-02", qty: 4 },
        { sku: "CAP-09", qty: 1 },
      ],
    ],
    expected: {
      rows: [
        { sku: "MUG-01", qty: 10 },
        { sku: "PEN-02", qty: 7 },
        { sku: "CAP-09", qty: 1 },
      ],
      inserted: 1,
      updated: 1,
    },
  },
  {
    name: "the same sku twice: the first inserts, the second updates",
    args: [
      [],
      [
        { sku: "BAG-05", qty: 2 },
        { sku: "BAG-05", qty: 5 },
      ],
    ],
    expected: { rows: [{ sku: "BAG-05", qty: 7 }], inserted: 1, updated: 1 },
  },
  {
    name: "no incoming rows changes nothing",
    args: [[{ sku: "MUG-01", qty: 10 }], []],
    expected: { rows: [{ sku: "MUG-01", qty: 10 }], inserted: 0, updated: 0 },
    hidden: true,
  },
  {
    name: "replaying the same event twice doubles the delta (upserts are not automatically idempotent)",
    args: [
      [{ sku: "MUG-01", qty: 10 }],
      [
        { sku: "MUG-01", qty: 1 },
        { sku: "MUG-01", qty: 1 },
      ],
    ],
    expected: { rows: [{ sku: "MUG-01", qty: 12 }], inserted: 0, updated: 2 },
    hidden: true,
  },
];
