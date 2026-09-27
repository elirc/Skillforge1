import type { TestCase } from "@content/_authoring/types";

export const functionName = "runMachine";

const orderMachine = {
  initial: "pending",
  final: ["delivered", "cancelled"],
  transitions: [
    { from: "pending", event: "pay", to: "paid" },
    { from: "paid", event: "ship", to: "shipped" },
    { from: "shipped", event: "deliver", to: "delivered" },
    { from: "*", event: "cancel", to: "cancelled" },
    { from: "shipped", event: "cancel", to: "returning" },
    { from: "returning", event: "receive", to: "cancelled" },
  ],
};

export const tests: TestCase[] = [
  {
    name: "happy path to delivery",
    args: [orderMachine, ["pay", "ship", "deliver"]],
    expected: { state: "delivered", history: ["pending", "paid", "shipped", "delivered"], rejected: [] },
  },
  {
    name: "rejects an event that is not allowed yet",
    args: [orderMachine, ["ship", "pay"]],
    expected: { state: "paid", history: ["pending", "paid"], rejected: ["ship@pending"] },
  },
  {
    name: "wildcard cancel works from any state",
    args: [orderMachine, ["pay", "cancel"]],
    expected: { state: "cancelled", history: ["pending", "paid", "cancelled"], rejected: [] },
  },
  {
    name: "a specific transition beats the wildcard even when listed later",
    args: [orderMachine, ["pay", "ship", "cancel", "receive"]],
    expected: {
      state: "cancelled",
      history: ["pending", "paid", "shipped", "returning", "cancelled"],
      rejected: [],
    },
  },
  {
    name: "final states reject everything, even wildcard events",
    args: [orderMachine, ["cancel", "cancel", "pay"]],
    expected: { state: "cancelled", history: ["pending", "cancelled"], rejected: ["cancel@cancelled", "pay@cancelled"] },
  },
  {
    name: "no events leaves the initial state",
    args: [orderMachine, []],
    expected: { state: "pending", history: ["pending"], rejected: [] },
  },
  {
    name: "self-transitions are recorded",
    args: [
      { initial: "idle", transitions: [{ from: "idle", event: "ping", to: "idle" }] },
      ["ping", "ping"],
    ],
    expected: { state: "idle", history: ["idle", "idle", "idle"], rejected: [] },
    hidden: true,
  },
  {
    name: "the first matching transition wins",
    args: [
      {
        initial: "a",
        transitions: [
          { from: "a", event: "go", to: "b" },
          { from: "a", event: "go", to: "c" },
        ],
      },
      ["go", "go"],
    ],
    expected: { state: "b", history: ["a", "b"], rejected: ["go@b"] },
    hidden: true,
  },
];
