import type { TestCase } from "@content/_authoring/types";

export const functionName = "applyOrderEvents";

export const tests: TestCase[] = [
  { name: "no events leaves the order pending", args: [[]], expected: { status: "pending", errors: [] } },
  { name: "the happy path ends delivered", args: [["pay", "ship", "deliver"]], expected: { status: "delivered", errors: [] } },
  { name: "a paid order can be cancelled", args: [["pay", "cancel"]], expected: { status: "cancelled", errors: [] } },
  {
    name: "shipping before paying is rejected",
    args: [["ship", "pay"]],
    expected: { status: "paid", errors: ["cannot ship when pending"] },
  },
  {
    name: "unknown events are reported and skipped",
    args: [["pay", "refund", "ship"]],
    expected: { status: "shipped", errors: ["unknown event: refund"] },
  },
  {
    name: "a shipped order can no longer be cancelled",
    args: [["pay", "ship", "cancel"]],
    expected: { status: "shipped", errors: ["cannot cancel when shipped"] },
  },
  {
    name: "terminal states reject everything",
    args: [["cancel", "pay", "cancel"]],
    expected: { status: "cancelled", errors: ["cannot pay when cancelled", "cannot cancel when cancelled"] },
    hidden: true,
  },
  {
    name: "inherited object keys are not events",
    args: [["toString", "constructor"]],
    expected: { status: "pending", errors: ["unknown event: toString", "unknown event: constructor"] },
    hidden: true,
  },
];
