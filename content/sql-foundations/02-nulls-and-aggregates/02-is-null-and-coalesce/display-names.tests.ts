import type { TestCase } from "@content/_authoring/types";

export const functionName = "displayNames";

export const tests: TestCase[] = [
  {
    name: "picks the first non-NULL of nickname, first_name, 'Anonymous'",
    args: [
      [
        { id: 1, nickname: "Ace", firstName: "Ada", deletedAt: null },
        { id: 2, nickname: null, firstName: "Bo", deletedAt: null },
        { id: 3, nickname: null, firstName: null, deletedAt: null },
      ],
    ],
    expected: [
      { id: 1, displayName: "Ace" },
      { id: 2, displayName: "Bo" },
      { id: 3, displayName: "Anonymous" },
    ],
  },
  {
    name: "soft-deleted rows are filtered out and the result is ordered by id",
    args: [
      [
        { id: 7, nickname: null, firstName: "Gus", deletedAt: null },
        { id: 4, nickname: "Dee", firstName: "Dana", deletedAt: "2026-01-02" },
        { id: 5, nickname: null, firstName: "Eve", deletedAt: null },
      ],
    ],
    expected: [
      { id: 5, displayName: "Eve" },
      { id: 7, displayName: "Gus" },
    ],
  },
  {
    name: "an empty string nickname is a value, not NULL",
    args: [[{ id: 8, nickname: "", firstName: "Hal", deletedAt: null }]],
    expected: [{ id: 8, displayName: "" }],
    hidden: true,
  },
  { name: "an empty table returns no rows", args: [[]], expected: [], hidden: true },
];
