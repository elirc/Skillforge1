import type { TestCase } from "@content/_authoring/types";

export const functionName = "findDeadlock";

export const tests: TestCase[] = [
  {
    name: "classic two-transaction deadlock (opposite lock order)",
    args: [
      [
        { resource: "account:1", heldBy: "T1" },
        { resource: "account:2", heldBy: "T2" },
      ],
      [
        { tx: "T1", resource: "account:2" },
        { tx: "T2", resource: "account:1" },
      ],
    ],
    expected: ["T1", "T2"],
  },
  {
    name: "plain blocking is not a deadlock",
    args: [[{ resource: "account:1", heldBy: "T1" }], [{ tx: "T2", resource: "account:1" }]],
    expected: [],
  },
  {
    name: "three-way cycle",
    args: [
      [
        { resource: "a", heldBy: "T1" },
        { resource: "b", heldBy: "T2" },
        { resource: "c", heldBy: "T3" },
      ],
      [
        { tx: "T1", resource: "b" },
        { tx: "T2", resource: "c" },
        { tx: "T3", resource: "a" },
      ],
    ],
    expected: ["T1", "T2", "T3"],
  },
  {
    name: "a transaction queued behind a deadlock is blocked but not part of the cycle",
    args: [
      [
        { resource: "a", heldBy: "T1" },
        { resource: "b", heldBy: "T2" },
      ],
      [
        { tx: "T1", resource: "b" },
        { tx: "T2", resource: "a" },
        { tx: "T3", resource: "a" },
      ],
    ],
    expected: ["T1", "T2"],
  },
  {
    name: "consistent lock order means a chain, never a cycle",
    args: [
      [
        { resource: "account:1", heldBy: "T1" },
        { resource: "account:2", heldBy: "T1" },
      ],
      [
        { tx: "T2", resource: "account:1" },
        { tx: "T3", resource: "account:1" },
      ],
    ],
    expected: [],
  },
  {
    name: "waiting for a free resource is not blocking at all",
    args: [[], [{ tx: "T1", resource: "x" }]],
    expected: [],
    hidden: true,
  },
  {
    name: "two independent deadlocks are both reported",
    args: [
      [
        { resource: "a", heldBy: "T1" },
        { resource: "b", heldBy: "T2" },
        { resource: "c", heldBy: "T8" },
        { resource: "d", heldBy: "T9" },
      ],
      [
        { tx: "T1", resource: "b" },
        { tx: "T2", resource: "a" },
        { tx: "T8", resource: "d" },
        { tx: "T9", resource: "c" },
      ],
    ],
    expected: ["T1", "T2", "T8", "T9"],
    hidden: true,
  },
];
