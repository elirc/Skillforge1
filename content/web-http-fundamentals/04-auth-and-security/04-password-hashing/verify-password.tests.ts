import type { TestCase } from "@content/_authoring/types";

export const functionName = "verifyPassword";

const ADA = "toy1$1000$q7Rz$e26fb2d4"; // password "correct horse"

export const tests: TestCase[] = [
  { name: "the right password verifies", args: [ADA, "correct horse"], expected: { ok: true, needsRehash: false } },
  { name: "the wrong password fails", args: [ADA, "correct horse "], expected: { ok: false, needsRehash: false } },
  { name: "passwords are case-sensitive", args: [ADA, "Correct horse"], expected: { ok: false, needsRehash: false } },
  {
    name: "the same password with a different salt has a different hash",
    args: ["toy1$1000$salt2$4fc1a4b2", "correct horse"],
    expected: { ok: true, needsRehash: false },
  },
  { name: "an old low-cost record asks for a rehash", args: ["toy1$10$x1$0e89a647", "hunter2"], expected: { ok: true, needsRehash: true } },
  { name: "a failed login never asks for a rehash", args: ["toy1$10$x1$0e89a647", "hunter3"], expected: { ok: false, needsRehash: false } },
  { name: "an unknown scheme is rejected", args: ["md5$1000$q7Rz$e26fb2d4", "correct horse"], expected: { ok: false, needsRehash: false } },
  { name: "a higher cost than policy is fine", args: ["toy1$5000$Zk9$d481bc34", "letmein"], expected: { ok: true, needsRehash: false }, hidden: true },
  { name: "zero iterations is invalid", args: ["toy1$0$a$a:", "x"], expected: { ok: false, needsRehash: false }, hidden: true },
  { name: "a truncated hash does not match", args: ["toy1$1000$q7Rz$e26fb2", "correct horse"], expected: { ok: false, needsRehash: false }, hidden: true },
];
