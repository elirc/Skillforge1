import type { TestCase } from "@content/_authoring/types";

export const functionName = "Summarize";

const customer = (Id: number, Name: string) => ({ Id, Name });
const order = (Id: number, CustomerId: number, Total: number, day: string) => ({
  Id,
  CustomerId,
  Total,
  PlacedAt: `${day}T10:00:00Z`,
});
const summary = (CustomerId: number, Name: string, OrderCount: number, LifetimeValue: number, LastOrderDate: string) => ({
  CustomerId,
  Name,
  OrderCount,
  LifetimeValue,
  LastOrderDate,
});

const customers = [customer(1, "Ada"), customer(2, "Grace"), customer(3, "Linus")];

export const tests: TestCase[] = [
  {
    name: "keeps customers without orders",
    args: [customers, [order(10, 1, 40, "2026-03-01"), order(11, 2, 90, "2026-02-01"), order(12, 1, 20, "2026-04-15")]],
    expected: [
      summary(2, "Grace", 1, 90, "2026-02-01"),
      summary(1, "Ada", 2, 60, "2026-04-15"),
      summary(3, "Linus", 0, 0, "never"),
    ],
  },
  {
    name: "ignores orders for unknown customers",
    args: [[customer(1, "Ada")], [order(10, 99, 500, "2026-01-01"), order(11, 1, 5, "2026-01-02")]],
    expected: [summary(1, "Ada", 1, 5, "2026-01-02")],
  },
  {
    name: "equal spend is ordered by name",
    args: [customers, [order(10, 3, 10, "2026-01-01"), order(11, 1, 10, "2026-01-01")]],
    expected: [
      summary(1, "Ada", 1, 10, "2026-01-01"),
      summary(3, "Linus", 1, 10, "2026-01-01"),
      summary(2, "Grace", 0, 0, "never"),
    ],
  },
  {
    name: "no orders at all",
    args: [[customer(2, "Grace"), customer(1, "Ada")], []],
    expected: [summary(1, "Ada", 0, 0, "never"), summary(2, "Grace", 0, 0, "never")],
  },
  { name: "no customers", args: [[], [order(1, 1, 10, "2026-01-01")]], expected: [] },
  {
    name: "the last order is the latest date, not the last row",
    args: [[customer(1, "Ada")], [order(10, 1, 1, "2026-05-01"), order(11, 1, 1, "2026-01-01")]],
    expected: [summary(1, "Ada", 2, 2, "2026-05-01")],
  },
  {
    name: "customers with the same name fall back to id",
    args: [[customer(7, "Sam"), customer(4, "Sam")], []],
    expected: [summary(4, "Sam", 0, 0, "never"), summary(7, "Sam", 0, 0, "never")],
    hidden: true,
  },
  {
    name: "sums cents exactly",
    args: [[customer(1, "Ada")], [order(1, 1, 0.1, "2026-01-01"), order(2, 1, 0.2, "2026-01-02")]],
    expected: [summary(1, "Ada", 2, 0.3, "2026-01-02")],
    hidden: true,
  },
];
