import type { TestCase } from "@content/_authoring/types";

export const functionName = "runTransaction";

export const tests: TestCase[] = [
  {
    name: "all transfers succeed and commit",
    args: [
      { alice: 100, bob: 50, carol: 0 },
      [
        { from: "alice", to: "bob", amount: 30 },
        { from: "bob", to: "carol", amount: 60 },
      ],
    ],
    expected: { committed: true, balances: { alice: 70, bob: 20, carol: 60 } },
  },
  {
    name: "an overdraft rolls back the earlier transfers too",
    args: [
      { alice: 100, bob: 50 },
      [
        { from: "alice", to: "bob", amount: 30 },
        { from: "bob", to: "alice", amount: 500 },
      ],
    ],
    expected: { committed: false, balances: { alice: 100, bob: 50 } },
  },
  {
    name: "a missing account rolls back",
    args: [{ alice: 100 }, [{ from: "alice", to: "mallory", amount: 10 }]],
    expected: { committed: false, balances: { alice: 100 } },
    hidden: true,
  },
  {
    name: "draining an account to exactly zero is allowed",
    args: [{ alice: 40, bob: 0 }, [{ from: "alice", to: "bob", amount: 40 }]],
    expected: { committed: true, balances: { alice: 0, bob: 40 } },
    hidden: true,
  },
  {
    name: "a later transfer can spend money received earlier in the same transaction",
    args: [
      { alice: 10, bob: 0 },
      [
        { from: "alice", to: "bob", amount: 10 },
        { from: "bob", to: "alice", amount: 5 },
      ],
    ],
    expected: { committed: true, balances: { alice: 5, bob: 5 } },
    hidden: true,
  },
  { name: "an empty transaction commits unchanged", args: [{ alice: 1 }, []], expected: { committed: true, balances: { alice: 1 } }, hidden: true },
];
