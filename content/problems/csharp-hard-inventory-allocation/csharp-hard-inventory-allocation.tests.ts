import type { TestCase } from "@content/_authoring/types";

export const functionName = "Allocate";

const stockRow = (Warehouse: string, Sku: string, Quantity: number) => ({ Warehouse, Sku, Quantity });
const order = (Id: string, Priority: number, lines: [string, number][]) => ({
  Id,
  Priority,
  Lines: lines.map(([Sku, Quantity]) => ({ Sku, Quantity })),
});
const alloc = (OrderId: string, Sku: string, Warehouse: string, Quantity: number) => ({
  OrderId,
  Sku,
  Warehouse,
  Quantity,
});

const stock = [stockRow("SEA", "SKU-1", 5), stockRow("PDX", "SKU-1", 4), stockRow("PDX", "SKU-2", 2)];
const nearestFirst = ["SEA", "PDX"];

export const tests: TestCase[] = [
  {
    name: "fills from the nearest warehouse",
    args: [[order("A1", 1, [["SKU-1", 3]])], stock, nearestFirst],
    expected: { Allocations: [alloc("A1", "SKU-1", "SEA", 3)], Backordered: [] },
  },
  {
    name: "splits a line across warehouses",
    args: [[order("A1", 1, [["SKU-1", 7]])], stock, nearestFirst],
    expected: { Allocations: [alloc("A1", "SKU-1", "SEA", 5), alloc("A1", "SKU-1", "PDX", 2)], Backordered: [] },
  },
  {
    name: "higher priority orders win scarce stock",
    args: [[order("low", 1, [["SKU-2", 2]]), order("vip", 5, [["SKU-2", 2]])], stock, nearestFirst],
    expected: { Allocations: [alloc("vip", "SKU-2", "PDX", 2)], Backordered: ["low"] },
  },
  {
    name: "a short order reserves nothing",
    args: [
      [
        order("A1", 1, [
          ["SKU-1", 2],
          ["SKU-2", 3],
        ]),
        order("A2", 1, [["SKU-1", 9]]),
      ],
      stock,
      nearestFirst,
    ],
    expected: { Allocations: [alloc("A2", "SKU-1", "SEA", 5), alloc("A2", "SKU-1", "PDX", 4)], Backordered: ["A1"] },
  },
  {
    name: "equal priorities are processed by Id",
    args: [[order("B", 1, [["SKU-2", 2]]), order("A", 1, [["SKU-2", 2]])], stock, nearestFirst],
    expected: { Allocations: [alloc("A", "SKU-2", "PDX", 2)], Backordered: ["B"] },
  },
  {
    name: "an unknown SKU is backordered",
    args: [[order("A1", 1, [["SKU-404", 1]])], stock, nearestFirst],
    expected: { Allocations: [], Backordered: ["A1"] },
  },
  {
    name: "repeated SKU lines are checked together",
    args: [
      [
        order("A1", 1, [
          ["SKU-2", 1],
          ["SKU-2", 2],
        ]),
      ],
      stock,
      nearestFirst,
    ],
    expected: { Allocations: [], Backordered: ["A1"] },
    hidden: true,
  },
  {
    name: "follows the given warehouse preference",
    args: [[order("A1", 1, [["SKU-1", 6]])], stock, ["PDX", "SEA"]],
    expected: { Allocations: [alloc("A1", "SKU-1", "PDX", 4), alloc("A1", "SKU-1", "SEA", 2)], Backordered: [] },
    hidden: true,
  },
  {
    name: "duplicate stock rows are added together",
    args: [[order("A1", 1, [["SKU-3", 2]])], [stockRow("SEA", "SKU-3", 1), stockRow("SEA", "SKU-3", 1)], nearestFirst],
    expected: { Allocations: [alloc("A1", "SKU-3", "SEA", 2)], Backordered: [] },
    hidden: true,
  },
];
