import type { TestCase } from "@content/_authoring/types";

export const functionName = "Process";

const a = (Id: string, Balance: number, Frozen = false) => ({ Id, Balance, Frozen });
const t = (Id: string, From: string, To: string, Amount: number) => ({ Id, From, To, Amount });

export const tests: TestCase[] = [
  {
    name: "successful transfers move money",
    args: [[a("A", 100), a("B", 10)], [t("t1", "A", "B", 40), t("t2", "B", "A", 5)]],
    expected: { Log: ["t1 ok", "t2 ok"], Balances: ["A=65", "B=45"] },
  },
  {
    name: "insufficient funds reports the exception's data",
    args: [[a("A", 30), a("B", 0)], [t("t1", "A", "B", 50)]],
    expected: {
      Log: ["t1 failed: insufficient funds in A (balance 30, requested 50)"],
      Balances: ["A=30", "B=0"],
    },
  },
  {
    name: "a frozen receiving account blocks the transfer",
    args: [[a("A", 100), a("B", 0, true)], [t("t1", "A", "B", 10)]],
    expected: { Log: ["t1 failed: account B is frozen"], Balances: ["A=100", "B=0"] },
  },
  {
    name: "bad input is rejected as a result, not an exception",
    args: [
      [a("A", 100), a("B", 0)],
      [t("t1", "A", "B", 0), t("t2", "A", "A", 5), t("t3", "X", "B", 5), t("t4", "A", "Y", 5)],
    ],
    expected: {
      Log: [
        "t1 rejected: amount must be positive",
        "t2 rejected: cannot transfer to the same account",
        "t3 rejected: unknown account X",
        "t4 rejected: unknown account Y",
      ],
      Balances: ["A=100", "B=0"],
    },
  },
  {
    name: "a failed transfer does not stop the batch",
    args: [
      [a("A", 20), a("B", 0), a("C", 0)],
      [t("t1", "A", "B", 50), t("t2", "A", "C", 20), t("t3", "A", "B", 1)],
    ],
    expected: {
      Log: ["t1 failed: insufficient funds in A (balance 20, requested 50)", "t2 ok", "t3 failed: insufficient funds in A (balance 0, requested 1)"],
      Balances: ["A=0", "B=0", "C=20"],
    },
  },
  {
    name: "validation runs before the frozen check",
    args: [[a("A", 100, true)], [t("t1", "A", "A", -1), t("t2", "A", "Z", 5)]],
    expected: {
      Log: ["t1 rejected: amount must be positive", "t2 rejected: unknown account Z"],
      Balances: ["A=100"],
    },
    hidden: true,
  },
  {
    name: "a frozen sender is reported before its balance",
    args: [[a("A", 5, true), a("B", 0)], [t("t1", "A", "B", 50)]],
    expected: { Log: ["t1 failed: account A is frozen"], Balances: ["A=5", "B=0"] },
    hidden: true,
  },
];
