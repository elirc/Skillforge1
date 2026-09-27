import type { TestCase } from "@content/_authoring/types";

export const functionName = "logOrder";

export const tests: TestCase[] = [
  {
    name: "timer, promise, sync",
    args: [[{ kind: "macrotask", label: "timeout" }, { kind: "microtask", label: "then" }, { kind: "sync", label: "log" }]],
    expected: ["log", "then", "timeout"],
  },
  {
    name: "keeps source order inside each queue",
    args: [
      [
        { kind: "sync", label: "A" },
        { kind: "macrotask", label: "B" },
        { kind: "microtask", label: "C" },
        { kind: "sync", label: "D" },
        { kind: "microtask", label: "E" },
      ],
    ],
    expected: ["A", "D", "C", "E", "B"],
  },
  { name: "only synchronous code", args: [[{ kind: "sync", label: "x" }, { kind: "sync", label: "y" }]], expected: ["x", "y"], hidden: true },
  { name: "empty script", args: [[]], expected: [], hidden: true },
];
