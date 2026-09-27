import type { TestCase } from "@content/_authoring/types";

export const functionName = "accountLog";

export const tests: TestCase[] = [
  {
    name: "deposits and withdrawals update the balance",
    args: [[{ type: "deposit", amount: 100 }, { type: "withdraw", amount: 30 }]],
    expected: [100, 70],
  },
  {
    name: "overdraft is rejected and the balance is unchanged",
    args: [[{ type: "deposit", amount: 50 }, { type: "withdraw", amount: 80 }, { type: "withdraw", amount: 50 }]],
    expected: [50, "insufficient funds", 0],
  },
  {
    name: "non-positive amounts are rejected",
    args: [[{ type: "deposit", amount: 0 }, { type: "deposit", amount: -5 }, { type: "deposit", amount: 5 }]],
    expected: ["amount must be positive", "amount must be positive", 5],
  },
  { name: "withdrawing from an empty account fails", args: [[{ type: "withdraw", amount: 1 }]], expected: ["insufficient funds"], hidden: true },
  { name: "no ops", args: [[]], expected: [], hidden: true },
];
