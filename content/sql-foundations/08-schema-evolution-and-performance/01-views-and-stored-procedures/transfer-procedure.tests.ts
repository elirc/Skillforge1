import type { TestCase } from "@content/_authoring/types";

export const functionName = "transferFunds";

const accounts = [
  { id: 1, balance: 100 },
  { id: 2, balance: 20 },
  { id: 3, balance: 0 },
];

export const tests: TestCase[] = [
  {
    name: "a valid transfer moves money between the two rows",
    args: [accounts, 1, 2, 30],
    expected: {
      status: "ok",
      accounts: [
        { id: 1, balance: 70 },
        { id: 2, balance: 50 },
        { id: 3, balance: 0 },
      ],
    },
  },
  {
    name: "insufficient funds rolls back: nothing changes",
    args: [accounts, 2, 3, 21],
    expected: { status: "insufficient-funds", accounts },
  },
  {
    name: "transferring the entire balance is allowed",
    args: [accounts, 2, 3, 20],
    expected: {
      status: "ok",
      accounts: [
        { id: 1, balance: 100 },
        { id: 2, balance: 0 },
        { id: 3, balance: 20 },
      ],
    },
  },
  { name: "zero or negative amounts are rejected first", args: [accounts, 1, 2, 0], expected: { status: "invalid-amount", accounts } },
  { name: "same source and target is rejected", args: [accounts, 1, 1, 10], expected: { status: "same-account", accounts } },
  { name: "an unknown account id is rejected", args: [accounts, 1, 9, 10], expected: { status: "unknown-account", accounts } },
  { name: "fractional amounts are invalid for an int parameter", args: [accounts, 1, 2, 2.5], expected: { status: "invalid-amount", accounts }, hidden: true },
  { name: "checks run in order: invalid amount beats unknown account", args: [accounts, 8, 9, -1], expected: { status: "invalid-amount", accounts }, hidden: true },
];
