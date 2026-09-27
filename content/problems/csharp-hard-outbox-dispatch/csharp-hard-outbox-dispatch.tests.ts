import type { TestCase } from "@content/_authoring/types";

export const functionName = "Dispatch";

const msg = (Id: string, CreatedAt: number) => ({ Id, CreatedAt });

export const tests: TestCase[] = [
  {
    name: "sends everything when the broker is healthy",
    args: [[msg("m1", 0), msg("m2", 0), msg("m3", 2)], [], 10, 3],
    expected: ["t=0 sent m1", "t=0 sent m2", "t=2 sent m3"],
  },
  {
    name: "retries with exponential backoff",
    args: [[msg("m1", 0)], ["m1#1", "m1#2"], 10, 5],
    expected: ["t=0 retry m1 at 1", "t=1 retry m1 at 3", "t=3 sent m1"],
  },
  {
    name: "dead-letters after the last attempt",
    args: [[msg("m1", 0)], ["m1#1", "m1#2", "m1#3"], 10, 3],
    expected: ["t=0 retry m1 at 1", "t=1 retry m1 at 3", "t=3 dead m1"],
  },
  {
    name: "a full batch leaves work for the next tick",
    args: [[msg("m1", 0), msg("m2", 0), msg("m3", 0)], [], 2, 3],
    expected: ["t=0 sent m1", "t=0 sent m2", "t=1 sent m3"],
  },
  {
    name: "orders by CreatedAt, then Id",
    args: [[msg("b", 1), msg("a", 1), msg("c", 0)], [], 1, 3],
    expected: ["t=0 sent c", "t=1 sent a", "t=2 sent b"],
  },
  {
    name: "an older retry goes before a newer message",
    args: [[msg("m1", 0), msg("m2", 1)], ["m1#1"], 1, 3],
    expected: ["t=0 retry m1 at 1", "t=1 sent m1", "t=2 sent m2"],
  },
  { name: "an empty outbox logs nothing", args: [[], [], 5, 3], expected: [], hidden: true },
  {
    name: "maxAttempts of one dead-letters on the first failure",
    args: [[msg("m1", 0), msg("m2", 0)], ["m1#1"], 5, 1],
    expected: ["t=0 dead m1", "t=0 sent m2"],
    hidden: true,
  },
  {
    name: "skips idle seconds",
    args: [[msg("late", 10)], ["late#1"], 5, 3],
    expected: ["t=10 retry late at 11", "t=11 sent late"],
    hidden: true,
  },
];
