import type { TestCase } from "@content/_authoring/types";

export const functionName = "runEmitter";

export const tests: TestCase[] = [
  {
    name: "listeners run in registration order",
    args: [[
      { type: "on", event: "save", listener: "A" },
      { type: "on", event: "save", listener: "B" },
      { type: "emit", event: "save", payload: "1" },
    ]],
    expected: ["A:save:1", "B:save:1"],
  },
  {
    name: "emitting an event with no listeners does nothing",
    args: [[{ type: "on", event: "save", listener: "A" }, { type: "emit", event: "load", payload: "x" }]],
    expected: [],
  },
  {
    name: "off removes a listener",
    args: [[
      { type: "on", event: "save", listener: "A" },
      { type: "emit", event: "save", payload: "1" },
      { type: "off", event: "save", listener: "A" },
      { type: "emit", event: "save", payload: "2" },
    ]],
    expected: ["A:save:1"],
  },
  {
    name: "once fires a single time",
    args: [[
      { type: "once", event: "ready", listener: "A" },
      { type: "emit", event: "ready", payload: "1" },
      { type: "emit", event: "ready", payload: "2" },
    ]],
    expected: ["A:ready:1"],
  },
  {
    name: "a once listener does not make the next listener get skipped",
    args: [[
      { type: "once", event: "tick", listener: "A" },
      { type: "on", event: "tick", listener: "B" },
      { type: "emit", event: "tick", payload: "1" },
      { type: "emit", event: "tick", payload: "2" },
    ]],
    expected: ["A:tick:1", "B:tick:1", "B:tick:2"],
  },
  {
    name: "listeners are per event",
    args: [[
      { type: "on", event: "a", listener: "L" },
      { type: "on", event: "b", listener: "L" },
      { type: "off", event: "a", listener: "L" },
      { type: "emit", event: "a", payload: "1" },
      { type: "emit", event: "b", payload: "2" },
    ]],
    expected: ["L:b:2"],
  },
  {
    name: "off for an unknown listener is harmless",
    args: [[
      { type: "off", event: "save", listener: "Z" },
      { type: "on", event: "save", listener: "A" },
      { type: "emit", event: "save", payload: "ok" },
    ]],
    expected: ["A:save:ok"],
    hidden: true,
  },
  {
    name: "two once listeners both fire on the first emit",
    args: [[
      { type: "once", event: "go", listener: "A" },
      { type: "once", event: "go", listener: "B" },
      { type: "emit", event: "go", payload: "1" },
      { type: "emit", event: "go", payload: "2" },
    ]],
    expected: ["A:go:1", "B:go:1"],
    hidden: true,
  },
];
