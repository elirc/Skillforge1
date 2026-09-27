import type { TestCase } from "@content/_authoring/types";

export const functionName = "paginate";

const cursorFor = (c: unknown, i?: unknown) =>
  Buffer.from(JSON.stringify(i === undefined ? { c } : { c, i })).toString("base64url");

const jan = (day: number) => `2026-01-0${day}T09:00:00Z`;
const items = [
  { id: 1, createdAt: jan(1) },
  { id: 3, createdAt: jan(3) },
  { id: 2, createdAt: jan(2) },
  { id: 5, createdAt: jan(4) },
  { id: 4, createdAt: jan(3) },
];

export const tests: TestCase[] = [
  {
    name: "first page starts at the newest item",
    args: [items, 2, null],
    expected: { ids: [5, 4], nextCursor: cursorFor(jan(3), 4) },
  },
  {
    name: "continues after the cursor",
    args: [items, 2, cursorFor(jan(3), 4)],
    expected: { ids: [3, 2], nextCursor: cursorFor(jan(2), 2) },
  },
  {
    name: "the last page has no next cursor",
    args: [items, 2, cursorFor(jan(2), 2)],
    expected: { ids: [1], nextCursor: null },
  },
  {
    name: "a page that fits exactly has no next cursor",
    args: [items, 5, null],
    expected: { ids: [5, 4, 3, 2, 1], nextCursor: null },
  },
  { name: "rejects garbage cursors", args: [items, 2, "not-a-cursor!!"], expected: { error: "invalid cursor" } },
  {
    name: "splits rows that share a timestamp",
    args: [items, 1, cursorFor(jan(3), 4)],
    expected: { ids: [3], nextCursor: cursorFor(jan(3), 3) },
  },
  {
    name: "rejects a cursor with the wrong shape",
    args: [items, 2, cursorFor(5)],
    expected: { error: "invalid cursor" },
    hidden: true,
  },
  { name: "an empty feed", args: [[], 10, null], expected: { ids: [], nextCursor: null }, hidden: true },
  {
    name: "a cursor for a deleted row still works",
    args: [items, 2, cursorFor(jan(3), 10)],
    expected: { ids: [4, 3], nextCursor: cursorFor(jan(3), 3) },
    hidden: true,
  },
];
