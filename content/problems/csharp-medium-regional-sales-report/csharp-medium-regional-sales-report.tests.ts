import type { TestCase } from "@content/_authoring/types";

export const functionName = "MonthlyByRegion";

// DateTime values are ISO-8601 strings; records are keyed by C# property names.
const sale = (Id: number, Region: string, PlacedAt: string, Total: number, Status = "Paid") => ({
  Id,
  Region,
  PlacedAt: `${PlacedAt}T12:00:00Z`,
  Total,
  Status,
});
const total = (Month: string, Region: string, OrderCount: number, Revenue: number) => ({
  Month,
  Region,
  OrderCount,
  Revenue,
});

const orders = [
  sale(1, "EU", "2026-01-05", 100),
  sale(2, "EU", "2026-01-20", 50.5),
  sale(3, "US", "2026-01-10", 200),
  sale(4, "US", "2026-02-01", 80),
  sale(5, "EU", "2026-02-14", 120, "Cancelled"),
  sale(6, "APAC", "2026-02-03", 80, "Pending"),
];

export const tests: TestCase[] = [
  {
    name: "groups by month and region",
    args: [orders],
    expected: [total("2026-01", "US", 1, 200), total("2026-01", "EU", 2, 150.5), total("2026-02", "APAC", 1, 80), total("2026-02", "US", 1, 80)],
  },
  {
    name: "a month with only cancelled orders disappears",
    args: [[sale(1, "EU", "2026-03-01", 10, "Cancelled"), sale(2, "EU", "2026-04-01", 10)]],
    expected: [total("2026-04", "EU", 1, 10)],
  },
  { name: "no orders", args: [[]], expected: [] },
  {
    name: "one region across months is ordered by month",
    args: [[sale(1, "US", "2026-05-01", 1), sale(2, "US", "2026-03-01", 2), sale(3, "US", "2026-04-01", 3)]],
    expected: [total("2026-03", "US", 1, 2), total("2026-04", "US", 1, 3), total("2026-05", "US", 1, 1)],
  },
  {
    name: "pending orders count toward revenue",
    args: [[sale(1, "EU", "2026-01-01", 5, "Pending"), sale(2, "EU", "2026-01-02", 7, "Paid")]],
    expected: [total("2026-01", "EU", 2, 12)],
  },
  {
    name: "cents add up exactly",
    args: [[sale(1, "EU", "2026-01-01", 0.1), sale(2, "EU", "2026-01-02", 0.2)]],
    expected: [total("2026-01", "EU", 2, 0.3)],
  },
  {
    name: "December sorts before the next January",
    args: [[sale(1, "EU", "2026-01-01", 1), sale(2, "EU", "2025-12-31", 1)]],
    expected: [total("2025-12", "EU", 1, 1), total("2026-01", "EU", 1, 1)],
    hidden: true,
  },
  {
    name: "revenue ties fall back to region order",
    args: [[sale(1, "US", "2026-01-01", 9), sale(2, "APAC", "2026-01-01", 9), sale(3, "EU", "2026-01-01", 9)]],
    expected: [total("2026-01", "APAC", 1, 9), total("2026-01", "EU", 1, 9), total("2026-01", "US", 1, 9)],
    hidden: true,
  },
];
