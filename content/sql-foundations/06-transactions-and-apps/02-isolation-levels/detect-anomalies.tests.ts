import type { TestCase } from "@content/_authoring/types";

export const functionName = "detectAnomalies";

export const tests: TestCase[] = [
  {
    name: "the classic lost update",
    args: [
      [
        { tx: "T1", op: "read", key: "x" },
        { tx: "T2", op: "read", key: "x" },
        { tx: "T1", op: "write", key: "x" },
        { tx: "T1", op: "commit" },
        { tx: "T2", op: "write", key: "x" },
        { tx: "T2", op: "commit" },
      ],
    ],
    expected: ["lost-update"],
  },
  {
    name: "reading another transaction's uncommitted write is a dirty read",
    args: [
      [
        { tx: "T1", op: "write", key: "x" },
        { tx: "T2", op: "read", key: "x" },
        { tx: "T1", op: "rollback" },
        { tx: "T2", op: "commit" },
      ],
    ],
    expected: ["dirty-read"],
  },
  {
    name: "a committed change between two reads is a non-repeatable read",
    args: [
      [
        { tx: "T1", op: "read", key: "x" },
        { tx: "T2", op: "write", key: "x" },
        { tx: "T2", op: "commit" },
        { tx: "T1", op: "read", key: "x" },
        { tx: "T1", op: "commit" },
      ],
    ],
    expected: ["non-repeatable-read"],
  },
  {
    name: "a serial schedule has no anomalies",
    args: [
      [
        { tx: "T1", op: "read", key: "x" },
        { tx: "T1", op: "write", key: "x" },
        { tx: "T1", op: "commit" },
        { tx: "T2", op: "read", key: "x" },
        { tx: "T2", op: "write", key: "x" },
        { tx: "T2", op: "commit" },
      ],
    ],
    expected: [],
  },
  {
    name: "interleaving on different keys is harmless",
    args: [
      [
        { tx: "T1", op: "read", key: "x" },
        { tx: "T2", op: "read", key: "y" },
        { tx: "T1", op: "write", key: "x" },
        { tx: "T2", op: "write", key: "y" },
        { tx: "T1", op: "commit" },
        { tx: "T2", op: "commit" },
      ],
    ],
    expected: [],
    hidden: true,
  },
  {
    name: "reading your own uncommitted write is not a dirty read",
    args: [
      [
        { tx: "T1", op: "write", key: "x" },
        { tx: "T1", op: "read", key: "x" },
        { tx: "T1", op: "commit" },
      ],
    ],
    expected: [],
    hidden: true,
  },
  {
    name: "no update is lost when the overwriting transaction rolls back",
    args: [
      [
        { tx: "T1", op: "read", key: "x" },
        { tx: "T2", op: "read", key: "x" },
        { tx: "T1", op: "write", key: "x" },
        { tx: "T1", op: "commit" },
        { tx: "T2", op: "write", key: "x" },
        { tx: "T2", op: "rollback" },
      ],
    ],
    expected: [],
    hidden: true,
  },
  {
    name: "several anomalies in one schedule are all reported, sorted",
    args: [
      [
        { tx: "T1", op: "read", key: "a" },
        { tx: "T2", op: "read", key: "a" },
        { tx: "T2", op: "write", key: "a" },
        { tx: "T3", op: "read", key: "a" },
        { tx: "T2", op: "commit" },
        { tx: "T1", op: "write", key: "a" },
        { tx: "T3", op: "read", key: "a" },
        { tx: "T1", op: "commit" },
        { tx: "T3", op: "commit" },
      ],
    ],
    expected: ["dirty-read", "lost-update", "non-repeatable-read"],
    hidden: true,
  },
  {
    name: "re-reading after the other commit means nothing is lost",
    args: [
      [
        { tx: "T1", op: "read", key: "x" },
        { tx: "T2", op: "write", key: "x" },
        { tx: "T2", op: "commit" },
        { tx: "T1", op: "read", key: "x" },
        { tx: "T1", op: "write", key: "x" },
        { tx: "T1", op: "commit" },
      ],
    ],
    expected: ["non-repeatable-read"],
    hidden: true,
  },
];
