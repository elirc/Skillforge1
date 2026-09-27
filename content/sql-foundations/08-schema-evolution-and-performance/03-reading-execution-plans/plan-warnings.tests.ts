import type { TestCase } from "@content/_authoring/types";

export const functionName = "planWarnings";

export const tests: TestCase[] = [
  {
    name: "a big clustered index scan is flagged",
    args: [[{ id: 1, operator: "Clustered Index Scan", table: "orders", estimatedRows: 50000, actualRows: 50000, executions: 1 }]],
    expected: ["scan:1"],
  },
  {
    name: "a small scan is fine (scanning a tiny lookup table is cheap)",
    args: [[{ id: 1, operator: "Table Scan", table: "countries", estimatedRows: 200, actualRows: 200, executions: 1 }]],
    expected: [],
  },
  {
    name: "a seek with a 100x misestimate is flagged",
    args: [[{ id: 2, operator: "Index Seek", table: "orders", estimatedRows: 1, actualRows: 100, executions: 1 }]],
    expected: ["estimate:2"],
  },
  {
    name: "a key lookup run once per outer row is flagged",
    args: [[{ id: 3, operator: "Key Lookup", table: "orders", estimatedRows: 1, actualRows: 1, executions: 4000 }]],
    expected: ["lookup:3"],
  },
  {
    name: "one node can raise several warnings, in scan/estimate/lookup order",
    args: [[{ id: 4, operator: "Table Scan", table: "events", estimatedRows: 100, actualRows: 900000, executions: 1 }]],
    expected: ["scan:4", "estimate:4"],
  },
  {
    name: "warnings follow node order",
    args: [
      [
        { id: 1, operator: "Nested Loops", table: null, estimatedRows: 10, actualRows: 12, executions: 1 },
        { id: 2, operator: "Index Seek", table: "customers", estimatedRows: 10, actualRows: 12, executions: 1 },
        { id: 3, operator: "Key Lookup", table: "customers", estimatedRows: 1, actualRows: 1, executions: 12 },
        { id: 4, operator: "Clustered Index Scan", table: "orders", estimatedRows: 20000, actualRows: 20000, executions: 1 },
      ],
    ],
    expected: ["scan:4"],
  },
  {
    name: "an estimate of 0 is treated as 1 (no division by zero)",
    args: [[{ id: 5, operator: "Index Seek", table: "t", estimatedRows: 0, actualRows: 10, executions: 1 }]],
    expected: ["estimate:5"],
    hidden: true,
  },
  {
    name: "a 9x difference is under the threshold; exactly 1000 lookups is flagged",
    args: [
      [
        { id: 6, operator: "Index Seek", table: "t", estimatedRows: 10, actualRows: 90, executions: 1 },
        { id: 7, operator: "Key Lookup", table: "t", estimatedRows: 1, actualRows: 1, executions: 1000 },
      ],
    ],
    expected: ["lookup:7"],
    hidden: true,
  },
];
