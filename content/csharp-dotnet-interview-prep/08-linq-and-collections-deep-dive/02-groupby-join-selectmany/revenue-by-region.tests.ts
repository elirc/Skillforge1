import type { TestCase } from "@content/_authoring/types";

export const functionName = "Build";

interface Line {
  Sku: string;
  Quantity: number;
  UnitPrice: number;
}

const c = (Id: string, Region: string) => ({ Id, Name: Id.toUpperCase(), Region });
const line = (Sku: string, Quantity: number, UnitPrice: number): Line => ({ Sku, Quantity, UnitPrice });
const o = (Id: string, CustomerId: string, Lines: Line[]) => ({ Id, CustomerId, Lines });

const customers = [c("c1", "West"), c("c2", "West"), c("c3", "East"), c("c4", "North")];
const orders = [
  o("o1", "c1", [line("MUG", 2, 10), line("TEE", 1, 20)]),
  o("o2", "c3", [line("MUG", 5, 10)]),
  o("o3", "c1", [line("CAP", 1, 15)]),
  o("o4", "c9", [line("MUG", 100, 10)]),
];

const region = (
  Region: string,
  Customers: number,
  CustomersWithoutOrders: number,
  Orders: number,
  Units: number,
  Revenue: number,
) => ({ Region, Customers, CustomersWithoutOrders, Orders, Units, Revenue });

export const tests: TestCase[] = [
  {
    name: "full report: regions, top SKUs and orphan orders",
    args: [customers, orders],
    expected: {
      Regions: [region("West", 2, 1, 2, 4, 55), region("East", 1, 0, 1, 5, 50), region("North", 1, 1, 0, 0, 0)],
      TopSkus: [
        { Sku: "MUG", Units: 7 },
        { Sku: "CAP", Units: 1 },
        { Sku: "TEE", Units: 1 },
      ],
      OrphanOrderIds: ["o4"],
    },
  },
  {
    name: "customers without orders still appear in their region",
    args: [[c("c1", "South")], []],
    expected: { Regions: [region("South", 1, 1, 0, 0, 0)], TopSkus: [], OrphanOrderIds: [] },
  },
  {
    name: "orders with no customers are all orphans",
    args: [[], [o("b", "x", [line("MUG", 1, 1)]), o("a", "y", [])]],
    expected: { Regions: [], TopSkus: [], OrphanOrderIds: ["a", "b"] },
  },
  {
    name: "regions with equal revenue are ordered by name",
    args: [
      [c("c1", "Zeta"), c("c2", "Alpha")],
      [o("o1", "c1", [line("A", 1, 10)]), o("o2", "c2", [line("B", 2, 5)])],
    ],
    expected: {
      Regions: [region("Alpha", 1, 0, 1, 2, 10), region("Zeta", 1, 0, 1, 1, 10)],
      TopSkus: [
        { Sku: "B", Units: 2 },
        { Sku: "A", Units: 1 },
      ],
      OrphanOrderIds: [],
    },
  },
  {
    name: "only the top three SKUs are kept",
    args: [[c("c1", "West")], [o("o1", "c1", [line("D", 4, 1), line("A", 1, 1), line("C", 3, 1), line("B", 3, 1)])]],
    expected: {
      Regions: [region("West", 1, 0, 1, 11, 11)],
      TopSkus: [
        { Sku: "D", Units: 4 },
        { Sku: "B", Units: 3 },
        { Sku: "C", Units: 3 },
      ],
      OrphanOrderIds: [],
    },
  },
  {
    name: "an order with no lines counts as an order with zero units",
    args: [[c("c1", "East")], [o("o1", "c1", []), o("o2", "c1", [line("MUG", 1, 2.5)])]],
    expected: { Regions: [region("East", 1, 0, 2, 1, 2.5)], TopSkus: [{ Sku: "MUG", Units: 1 }], OrphanOrderIds: [] },
    hidden: true,
  },
  {
    name: "SKU units add up across orders and customers",
    args: [
      [c("c1", "West"), c("c2", "East")],
      [o("o1", "c1", [line("MUG", 2, 3)]), o("o2", "c2", [line("MUG", 3, 3)]), o("o3", "zz", [line("TEE", 9, 1)])],
    ],
    expected: {
      Regions: [region("East", 1, 0, 1, 3, 9), region("West", 1, 0, 1, 2, 6)],
      TopSkus: [{ Sku: "MUG", Units: 5 }],
      OrphanOrderIds: ["o3"],
    },
    hidden: true,
  },
];
