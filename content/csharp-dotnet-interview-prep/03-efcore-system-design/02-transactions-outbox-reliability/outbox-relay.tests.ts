import type { TestCase } from "@content/_authoring/types";

export const functionName = "RunRelay";

const row = (Id: string, Sequence: number, Processed = false) => ({ Id, Sequence, Processed });
const abc = [row("A", 1), row("B", 2), row("C", 3)];

export const tests: TestCase[] = [
  {
    name: "without a crash every message is delivered once",
    args: [abc, 0],
    expected: { Delivered: ["A", "B", "C"], Handled: ["A", "B", "C"] },
  },
  {
    name: "rows already processed are not published again",
    args: [[row("A", 1, true), row("B", 2), row("C", 3)], 0],
    expected: { Delivered: ["B", "C"], Handled: ["B", "C"] },
  },
  {
    name: "a crash after publishing but before marking redelivers that message",
    args: [abc, 2],
    expected: { Delivered: ["A", "B", "B", "C"], Handled: ["A", "B", "C"] },
  },
  {
    name: "publishes in Sequence order, not array order",
    args: [[row("C", 3), row("A", 1), row("B", 2)], 0],
    expected: { Delivered: ["A", "B", "C"], Handled: ["A", "B", "C"] },
  },
  {
    name: "a crash on the first publish",
    args: [abc, 1],
    expected: { Delivered: ["A", "A", "B", "C"], Handled: ["A", "B", "C"] },
  },
  {
    name: "a crash point beyond the pending rows never happens",
    args: [abc, 7],
    expected: { Delivered: ["A", "B", "C"], Handled: ["A", "B", "C"] },
    hidden: true,
  },
  {
    name: "nothing pending means nothing delivered",
    args: [[row("A", 1, true)], 1],
    expected: { Delivered: [], Handled: [] },
    hidden: true,
  },
  {
    name: "a crash on the last message redelivers only that one",
    args: [abc, 3],
    expected: { Delivered: ["A", "B", "C", "C"], Handled: ["A", "B", "C"] },
    hidden: true,
  },
];
