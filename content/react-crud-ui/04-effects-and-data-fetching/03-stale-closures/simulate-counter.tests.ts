import type { TestCase } from "@content/_authoring/types";

export const functionName = "simulateCounter";

const tick = { type: "tick" };
const threeTicks = [tick, tick, tick];

export const tests: TestCase[] = [
  {
    name: "[] + setCount(count + 1) gets stuck at 1",
    args: [threeTicks, { deps: "empty", update: "snapshot" }],
    expected: { count: 1, intervalsCreated: 1, intervalsCleared: 0 },
  },
  {
    name: "[] + updater counts correctly with one interval",
    args: [threeTicks, { deps: "empty", update: "updater" }],
    expected: { count: 3, intervalsCreated: 1, intervalsCleared: 0 },
  },
  {
    name: "[count] + snapshot works but re-creates the interval every tick",
    args: [threeTicks, { deps: "count", update: "snapshot" }],
    expected: { count: 3, intervalsCreated: 4, intervalsCleared: 3 },
  },
  {
    name: "a stale tick overwrites a click",
    args: [[{ type: "click", add: 5 }, tick], { deps: "empty", update: "snapshot" }],
    expected: { count: 1, intervalsCreated: 1, intervalsCleared: 0 },
  },
  {
    name: "the updater keeps the click",
    args: [[{ type: "click", add: 5 }, tick], { deps: "empty", update: "updater" }],
    expected: { count: 6, intervalsCreated: 1, intervalsCleared: 0 },
  },
  {
    name: "no events: just the mount",
    args: [[], { deps: "count", update: "updater" }],
    expected: { count: 0, intervalsCreated: 1, intervalsCleared: 0 },
  },
  {
    name: "[count] re-subscribes after a click too",
    args: [[{ type: "click", add: 10 }, tick, tick], { deps: "count", update: "snapshot" }],
    expected: { count: 12, intervalsCreated: 4, intervalsCleared: 3 },
    hidden: true,
  },
  {
    name: "a click of 0 changes nothing",
    args: [[{ type: "click", add: 0 }, tick], { deps: "count", update: "updater" }],
    expected: { count: 1, intervalsCreated: 2, intervalsCleared: 1 },
    hidden: true,
  },
];
