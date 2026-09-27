import type { TestCase } from "@content/_authoring/types";

export const functionName = "latestPerId";

export const tests: TestCase[] = [
  {
    name: "keeps the newest version of a record",
    args: [
      [
        { id: "a", updatedAt: "2026-01-01T10:00:00Z", title: "old" },
        { id: "a", updatedAt: "2026-01-02T10:00:00Z", title: "new" },
      ],
    ],
    expected: [{ id: "a", updatedAt: "2026-01-02T10:00:00Z", title: "new" }],
  },
  {
    name: "an older version arriving later does not win",
    args: [
      [
        { id: "a", updatedAt: "2026-03-01T00:00:00Z", done: true },
        { id: "a", updatedAt: "2026-02-01T00:00:00Z", done: false },
      ],
    ],
    expected: [{ id: "a", updatedAt: "2026-03-01T00:00:00Z", done: true }],
  },
  {
    name: "keeps first-seen order of ids",
    args: [
      [
        { id: "b", updatedAt: "2026-01-01T00:00:00Z" },
        { id: "a", updatedAt: "2026-01-01T00:00:00Z" },
        { id: "b", updatedAt: "2026-01-05T00:00:00Z" },
      ],
    ],
    expected: [
      { id: "b", updatedAt: "2026-01-05T00:00:00Z" },
      { id: "a", updatedAt: "2026-01-01T00:00:00Z" },
    ],
  },
  { name: "empty input", args: [[]], expected: [] },
  {
    name: "on a tie the first version wins",
    args: [
      [
        { id: "x", updatedAt: "2026-04-01T00:00:00Z", v: 1 },
        { id: "x", updatedAt: "2026-04-01T00:00:00Z", v: 2 },
      ],
    ],
    expected: [{ id: "x", updatedAt: "2026-04-01T00:00:00Z", v: 1 }],
    hidden: true,
  },
  {
    name: "handles many ids with interleaved versions",
    args: [
      [
        { id: "1", updatedAt: "2026-01-01T00:00:00Z", n: "a" },
        { id: "2", updatedAt: "2026-01-03T00:00:00Z", n: "b" },
        { id: "1", updatedAt: "2026-01-04T00:00:00Z", n: "c" },
        { id: "2", updatedAt: "2026-01-02T00:00:00Z", n: "d" },
        { id: "3", updatedAt: "2026-01-01T00:00:00Z", n: "e" },
      ],
    ],
    expected: [
      { id: "1", updatedAt: "2026-01-04T00:00:00Z", n: "c" },
      { id: "2", updatedAt: "2026-01-03T00:00:00Z", n: "b" },
      { id: "3", updatedAt: "2026-01-01T00:00:00Z", n: "e" },
    ],
    hidden: true,
  },
];
