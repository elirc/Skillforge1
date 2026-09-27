import type { TestCase } from "@content/_authoring/types";

export const functionName = "runHandler";

const plusOne = { kind: "snapshotPlus", delta: 1 };
const incOne = { kind: "updaterPlus", delta: 1 };

export const tests: TestCase[] = [
  {
    name: "setCount(count + 1) three times only adds one",
    args: [0, [plusOne, plusOne, plusOne]],
    expected: { logged: 0, next: 1 },
  },
  {
    name: "setCount(c => c + 1) three times adds three",
    args: [0, [incOne, incOne, incOne]],
    expected: { logged: 0, next: 3 },
  },
  {
    name: "console.log after setState still prints the snapshot",
    args: [4, [{ kind: "value", value: 10 }]],
    expected: { logged: 4, next: 10 },
  },
  {
    name: "a replace then an updater",
    args: [0, [{ kind: "value", value: 5 }, incOne]],
    expected: { logged: 0, next: 6 },
  },
  {
    name: "an updater then a snapshot-based set overwrites it",
    args: [2, [incOne, { kind: "snapshotPlus", delta: 10 }]],
    expected: { logged: 2, next: 12 },
  },
  {
    name: "updaters chain in order",
    args: [1, [incOne, { kind: "updaterTimes", factor: 3 }, incOne]],
    expected: { logged: 1, next: 7 },
  },
  {
    name: "no calls leaves state alone",
    args: [7, []],
    expected: { logged: 7, next: 7 },
  },
  {
    name: "snapshot set after updaters discards them",
    args: [3, [incOne, incOne, { kind: "updaterTimes", factor: 2 }, plusOne]],
    expected: { logged: 3, next: 4 },
    hidden: true,
  },
  {
    name: "a replace resets the chain for later updaters",
    args: [9, [{ kind: "updaterTimes", factor: 10 }, { kind: "value", value: 0 }, incOne, incOne]],
    expected: { logged: 9, next: 2 },
    hidden: true,
  },
];
