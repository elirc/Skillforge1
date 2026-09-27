import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayLedger";

const ev = (seq: number, account: string, type: string, amount = 0) => ({ seq, account, type, amount });

export const tests: TestCase[] = [
  {
    name: "replays a simple history",
    args: [[ev(1, "A", "opened"), ev(2, "A", "deposited", 500), ev(3, "A", "withdrew", 200)]],
    expected: { balances: { A: 300 }, rejected: [] },
  },
  {
    name: "applies events in seq order, not arrival order",
    args: [[ev(3, "A", "withdrew", 200), ev(1, "A", "opened"), ev(2, "A", "deposited", 500)]],
    expected: { balances: { A: 300 }, rejected: [] },
  },
  {
    name: "ignores duplicate deliveries",
    args: [[ev(1, "A", "opened"), ev(2, "A", "deposited", 500), ev(2, "A", "deposited", 500)]],
    expected: { balances: { A: 500 }, rejected: [] },
  },
  {
    name: "rejects an overdraft",
    args: [[ev(1, "A", "opened"), ev(2, "A", "deposited", 100), ev(3, "A", "withdrew", 150), ev(4, "A", "withdrew", 100)]],
    expected: { balances: { A: 0 }, rejected: [3] },
  },
  {
    name: "rejects activity on unopened or closed accounts",
    args: [
      [
        ev(1, "B", "deposited", 50),
        ev(2, "A", "opened"),
        ev(3, "A", "deposited", 10),
        ev(4, "A", "closed"),
        ev(5, "A", "withdrew", 10),
        ev(6, "A", "closed"),
        ev(7, "A", "deposited", 5),
      ],
    ],
    expected: { balances: {}, rejected: [1, 4, 7] },
  },
  { name: "no events", args: [[]], expected: { balances: {}, rejected: [] } },
  {
    name: "a closed account id cannot be reopened",
    args: [[ev(1, "A", "opened"), ev(2, "A", "closed"), ev(3, "A", "opened"), ev(4, "A", "opened")]],
    expected: { balances: {}, rejected: [3, 4] },
    hidden: true,
  },
  {
    name: "balances are keyed alphabetically",
    args: [[ev(1, "zed", "opened"), ev(2, "amy", "opened"), ev(3, "zed", "deposited", 7)]],
    expected: { balances: { amy: 0, zed: 7 }, rejected: [] },
    hidden: true,
  },
  {
    name: "the first delivery of a seq wins over a conflicting duplicate",
    args: [[ev(1, "A", "opened"), ev(2, "A", "deposited", 100), ev(2, "A", "deposited", 999)]],
    expected: { balances: { A: 100 }, rejected: [] },
    hidden: true,
  },
];
