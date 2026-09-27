import type { TestCase } from "@content/_authoring/types";

export const functionName = "backfillBatches";

export const tests: TestCase[] = [
  {
    name: "NULL rows are backfilled in ascending id batches",
    args: [
      [
        { id: 1, fullName: "Ada Lovelace", displayName: null },
        { id: 2, fullName: "Ben Ng", displayName: null },
        { id: 3, fullName: "Cy Twombly", displayName: null },
      ],
      2,
    ],
    expected: {
      batches: [[1, 2], [3]],
      rows: [
        { id: 1, fullName: "Ada Lovelace", displayName: "Ada Lovelace" },
        { id: 2, fullName: "Ben Ng", displayName: "Ben Ng" },
        { id: 3, fullName: "Cy Twombly", displayName: "Cy Twombly" },
      ],
      readyForNotNull: true,
    },
  },
  {
    name: "rows already written by the new code (dual write) are skipped and kept",
    args: [
      [
        { id: 1, fullName: "Ada Lovelace", displayName: "Ada" },
        { id: 2, fullName: "Ben Ng", displayName: null },
      ],
      10,
    ],
    expected: {
      batches: [[2]],
      rows: [
        { id: 1, fullName: "Ada Lovelace", displayName: "Ada" },
        { id: 2, fullName: "Ben Ng", displayName: "Ben Ng" },
      ],
      readyForNotNull: true,
    },
  },
  {
    name: "keyset order is by id, not input order",
    args: [
      [
        { id: 30, fullName: "C", displayName: null },
        { id: 10, fullName: "A", displayName: null },
        { id: 20, fullName: "B", displayName: null },
      ],
      1,
    ],
    expected: {
      batches: [[10], [20], [30]],
      rows: [
        { id: 10, fullName: "A", displayName: "A" },
        { id: 20, fullName: "B", displayName: "B" },
        { id: 30, fullName: "C", displayName: "C" },
      ],
      readyForNotNull: true,
    },
  },
  {
    name: "an empty string is a value, not NULL",
    args: [[{ id: 5, fullName: "Eve", displayName: "" }], 3],
    expected: { batches: [], rows: [{ id: 5, fullName: "Eve", displayName: "" }], readyForNotNull: true },
  },
  {
    name: "batch size larger than the work gives one batch",
    args: [
      [
        { id: 7, fullName: "G", displayName: null },
        { id: 8, fullName: "H", displayName: null },
      ],
      500,
    ],
    expected: {
      batches: [[7, 8]],
      rows: [
        { id: 7, fullName: "G", displayName: "G" },
        { id: 8, fullName: "H", displayName: "H" },
      ],
      readyForNotNull: true,
    },
  },
  { name: "an empty table needs no batches", args: [[], 100], expected: { batches: [], rows: [], readyForNotNull: true }, hidden: true },
  {
    name: "gaps in ids do not matter",
    args: [
      [
        { id: 2, fullName: "B", displayName: null },
        { id: 9, fullName: "I", displayName: "i" },
        { id: 15, fullName: "O", displayName: null },
        { id: 40, fullName: "Z", displayName: null },
      ],
      2,
    ],
    expected: {
      batches: [[2, 15], [40]],
      rows: [
        { id: 2, fullName: "B", displayName: "B" },
        { id: 9, fullName: "I", displayName: "i" },
        { id: 15, fullName: "O", displayName: "O" },
        { id: 40, fullName: "Z", displayName: "Z" },
      ],
      readyForNotNull: true,
    },
    hidden: true,
  },
];
