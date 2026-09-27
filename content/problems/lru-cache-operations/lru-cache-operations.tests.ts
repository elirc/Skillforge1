import type { TestCase } from "@content/_authoring/types";

export const functionName = "simulateLru";

export const tests: TestCase[] = [
  {
    name: "a get protects a key from eviction",
    args: [
      2,
      [
        ["put", "a", 1],
        ["put", "b", 2],
        ["get", "a"],
        ["put", "c", 3],
        ["get", "b"],
        ["get", "c"],
      ],
    ],
    expected: [null, null, 1, "b", null, 3],
  },
  {
    name: "evicts the oldest key when full",
    args: [
      2,
      [
        ["put", "a", 1],
        ["put", "b", 2],
        ["put", "c", 3],
        ["get", "a"],
      ],
    ],
    expected: [null, null, "a", null],
  },
  {
    name: "updating a key refreshes it without evicting",
    args: [
      2,
      [
        ["put", "a", 1],
        ["put", "b", 2],
        ["put", "a", 10],
        ["put", "c", 3],
        ["get", "a"],
      ],
    ],
    expected: [null, null, null, "b", 10],
  },
  {
    name: "capacity of one",
    args: [
      1,
      [
        ["put", "x", 1],
        ["put", "y", 2],
        ["get", "x"],
        ["get", "y"],
      ],
    ],
    expected: [null, "x", null, 2],
  },
  {
    name: "a miss does not change the order",
    args: [
      2,
      [
        ["put", "a", 1],
        ["put", "b", 2],
        ["get", "z"],
        ["put", "c", 3],
      ],
    ],
    expected: [null, null, null, "a"],
  },
  { name: "no operations", args: [3, []], expected: [] },
  {
    name: "a stored zero is still a hit",
    args: [
      2,
      [
        ["put", "a", 0],
        ["get", "a"],
      ],
    ],
    expected: [null, 0],
    hidden: true,
  },
  {
    name: "a longer mixed sequence",
    args: [
      3,
      [
        ["put", "a", 1],
        ["put", "b", 2],
        ["put", "c", 3],
        ["get", "a"],
        ["get", "b"],
        ["put", "d", 4],
        ["put", "e", 5],
        ["get", "a"],
        ["get", "d"],
      ],
    ],
    expected: [null, null, null, 1, 2, "c", "a", null, 4],
    hidden: true,
  },
];
