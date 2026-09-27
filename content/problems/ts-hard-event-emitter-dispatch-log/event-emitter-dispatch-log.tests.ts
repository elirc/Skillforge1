import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayEmitter";

export const tests: TestCase[] = [
  {
    name: "calls listeners in subscription order",
    args: [
      [
        { op: "on", event: "order.placed", id: "audit" },
        { op: "on", event: "order.placed", id: "email" },
        { op: "emit", event: "order.placed", payload: "o1" },
      ],
    ],
    expected: ["audit:order.placed:o1", "email:order.placed:o1"],
  },
  {
    name: "wildcard listeners run after specific ones",
    args: [
      [
        { op: "on", event: "*", id: "logger" },
        { op: "on", event: "user.signup", id: "welcome" },
        { op: "emit", event: "user.signup", payload: "u1" },
        { op: "emit", event: "user.login", payload: "u1" },
      ],
    ],
    expected: ["welcome:user.signup:u1", "logger:user.signup:u1", "logger:user.login:u1"],
  },
  {
    name: "once listeners fire a single time",
    args: [
      [
        { op: "once", event: "ready", id: "boot" },
        { op: "on", event: "ready", id: "metrics" },
        { op: "emit", event: "ready", payload: "1" },
        { op: "emit", event: "ready", payload: "2" },
      ],
    ],
    expected: ["boot:ready:1", "metrics:ready:1", "metrics:ready:2"],
  },
  {
    name: "off removes a listener and ignores unknown ids",
    args: [
      [
        { op: "on", event: "save", id: "a" },
        { op: "on", event: "save", id: "b" },
        { op: "off", event: "save", id: "a" },
        { op: "off", event: "save", id: "zzz" },
        { op: "emit", event: "save", payload: "doc" },
      ],
    ],
    expected: ["b:save:doc"],
  },
  {
    name: "events nobody listens to are logged as unhandled",
    args: [[{ op: "emit", event: "cart.abandoned", payload: "c9" }]],
    expected: ["unhandled:cart.abandoned"],
  },
  {
    name: "a nested emit runs depth-first before the next listener",
    args: [
      [
        { op: "on", event: "order.placed", id: "billing", emits: { event: "invoice.created", payload: "i1" } },
        { op: "on", event: "order.placed", id: "email" },
        { op: "on", event: "invoice.created", id: "pdf" },
        { op: "emit", event: "order.placed", payload: "o1" },
      ],
    ],
    expected: ["billing:order.placed:o1", "pdf:invoice.created:i1", "email:order.placed:o1"],
  },
  {
    name: "subscribing the same id twice is a no-op",
    args: [
      [
        { op: "on", event: "tick", id: "clock" },
        { op: "on", event: "tick", id: "clock" },
        { op: "emit", event: "tick", payload: "1" },
      ],
    ],
    expected: ["clock:tick:1"],
  },
  {
    name: "a listener that re-emits its own event overflows at depth 10",
    args: [
      [
        { op: "on", event: "ping", id: "echo", emits: { event: "ping", payload: "again" } },
        { op: "emit", event: "ping", payload: "start" },
      ],
    ],
    expected: [
      "echo:ping:start",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "echo:ping:again",
      "overflow:ping",
    ],
    hidden: true,
  },
  {
    name: "a once listener is removed before its nested emit runs",
    args: [
      [
        { op: "once", event: "tick", id: "first", emits: { event: "tick", payload: "nested" } },
        { op: "emit", event: "tick", payload: "outer" },
        { op: "emit", event: "tick", payload: "later" },
      ],
    ],
    expected: ["first:tick:outer", "unhandled:tick", "unhandled:tick"],
    hidden: true,
  },
  {
    name: "a once listener in the outer snapshot does not fire again after a nested dispatch",
    args: [
      [
        { op: "on", event: "save", id: "trigger", emits: { event: "save", payload: "inner" } },
        { op: "once", event: "save", id: "notify" },
        { op: "off", event: "save", id: "nobody" },
        { op: "emit", event: "save", payload: "outer" },
      ],
    ],
    expected: [
      "trigger:save:outer",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "trigger:save:inner",
      "overflow:save",
      "notify:save:inner",
    ],
    hidden: true,
  },
];
