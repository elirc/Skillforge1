import type { TestCase } from "@content/_authoring/types";

export const functionName = "applyBulkUpdate";

const task = (id: string, version: number, status: string, assignee: string | null) => ({ id, version, status, assignee });
const board = [task("t1", 1, "open", null), task("t2", 3, "open", "ann"), task("t3", 1, "done", "bo")];

export const tests: TestCase[] = [
  {
    name: "applies valid updates and bumps versions",
    args: [
      board,
      [
        { id: "t1", expectedVersion: 1, changes: { status: "in_progress" } },
        { id: "t2", expectedVersion: 3, changes: { assignee: "cy" } },
      ],
    ],
    expected: {
      records: [task("t1", 2, "in_progress", null), task("t2", 4, "open", "cy"), task("t3", 1, "done", "bo")],
      updated: ["t1", "t2"],
      unchanged: [],
      failed: [],
    },
  },
  {
    name: "reports each failure reason and leaves records alone",
    args: [
      board,
      [
        { id: "t9", expectedVersion: 1, changes: { status: "done" } },
        { id: "t2", expectedVersion: 2, changes: { status: "done" } },
        { id: "t3", expectedVersion: 1, changes: { title: "x" } },
        { id: "t1", expectedVersion: 1, changes: { status: "closed" } },
      ],
    ],
    expected: {
      records: board,
      updated: [],
      unchanged: [],
      failed: [
        { id: "t9", reason: "not found" },
        { id: "t2", reason: "version conflict (expected 2, found 3)" },
        { id: "t3", reason: "field not editable: title" },
        { id: "t1", reason: "invalid status: closed" },
      ],
    },
  },
  {
    name: "a no-op update does not bump the version",
    args: [board, [{ id: "t3", expectedVersion: 1, changes: { status: "done" } }]],
    expected: { records: board, updated: [], unchanged: ["t3"], failed: [] },
  },
  {
    name: "empty changes are rejected",
    args: [board, [{ id: "t1", expectedVersion: 1, changes: {} }]],
    expected: { records: board, updated: [], unchanged: [], failed: [{ id: "t1", reason: "no changes" }] },
  },
  {
    name: "a second stale edit to the same task conflicts",
    args: [
      board,
      [
        { id: "t1", expectedVersion: 1, changes: { status: "done" } },
        { id: "t1", expectedVersion: 1, changes: { assignee: "x" } },
      ],
    ],
    expected: {
      records: [task("t1", 2, "done", null), board[1], board[2]],
      updated: ["t1"],
      unchanged: [],
      failed: [{ id: "t1", reason: "version conflict (expected 1, found 2)" }],
    },
  },
  {
    name: "chained edits that track the version both apply",
    args: [
      board,
      [
        { id: "t1", expectedVersion: 1, changes: { status: "done" } },
        { id: "t1", expectedVersion: 2, changes: { assignee: "x" } },
      ],
    ],
    expected: {
      records: [task("t1", 3, "done", "x"), board[1], board[2]],
      updated: ["t1", "t1"],
      unchanged: [],
      failed: [],
    },
  },
  {
    name: "assignee can be cleared to null",
    args: [board, [{ id: "t2", expectedVersion: 3, changes: { assignee: null } }]],
    expected: { records: [board[0], task("t2", 4, "open", null), board[2]], updated: ["t2"], unchanged: [], failed: [] },
    hidden: true,
  },
  {
    name: "one real change among no-op fields still counts as an update",
    args: [board, [{ id: "t2", expectedVersion: 3, changes: { status: "open", assignee: "zed" } }]],
    expected: { records: [board[0], task("t2", 4, "open", "zed"), board[2]], updated: ["t2"], unchanged: [], failed: [] },
    hidden: true,
  },
];
