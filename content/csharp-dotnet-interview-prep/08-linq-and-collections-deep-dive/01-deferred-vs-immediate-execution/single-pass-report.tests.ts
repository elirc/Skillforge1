import type { TestCase } from "@content/_authoring/types";

export const functionName = "Summarize";

const o = (Id: number, Total: number, Status: string) => ({ Id, Total, Status });

export const tests: TestCase[] = [
  {
    name: "summarizes paid orders in one read",
    args: [[o(1, 40, "paid"), o(2, 120, "paid"), o(3, 999, "refunded"), o(4, 75, "paid")], 75],
    expected: { Count: 3, Sum: 235, Max: 120, BigOrderIds: [2, 4], SourceReads: 1 },
  },
  {
    name: "no paid orders still reads the source once",
    args: [[o(1, 10, "pending"), o(2, 20, "refunded")], 5],
    expected: { Count: 0, Sum: 0, Max: 0, BigOrderIds: [], SourceReads: 1 },
  },
  {
    name: "an empty source",
    args: [[], 100],
    expected: { Count: 0, Sum: 0, Max: 0, BigOrderIds: [], SourceReads: 1 },
  },
  {
    name: "status must match exactly",
    args: [[o(1, 50, "Paid"), o(2, 60, "paid")], 0],
    expected: { Count: 1, Sum: 60, Max: 60, BigOrderIds: [2], SourceReads: 1 },
  },
  {
    name: "big orders keep source order",
    args: [[o(9, 300, "paid"), o(3, 500, "paid"), o(7, 20, "paid")], 300],
    expected: { Count: 3, Sum: 820, Max: 500, BigOrderIds: [9, 3], SourceReads: 1 },
  },
  {
    name: "decimal totals",
    args: [[o(1, 19.99, "paid"), o(2, 0.01, "paid")], 100],
    expected: { Count: 2, Sum: 20, Max: 19.99, BigOrderIds: [], SourceReads: 1 },
    hidden: true,
  },
  {
    name: "a larger batch is still a single read",
    args: [Array.from({ length: 50 }, (_, i) => o(i + 1, (i + 1) * 10, i % 2 === 0 ? "paid" : "pending")), 480],
    expected: {
      Count: 25,
      Sum: 6250,
      Max: 490,
      BigOrderIds: [49],
      SourceReads: 1,
    },
    hidden: true,
  },
];
