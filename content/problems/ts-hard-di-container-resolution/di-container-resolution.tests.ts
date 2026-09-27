import type { TestCase } from "@content/_authoring/types";

export const functionName = "resolve";

const app = [
  { token: "Config", deps: [], lifetime: "singleton" },
  { token: "Logger", deps: ["Config"], lifetime: "singleton" },
  { token: "Db", deps: ["Config", "Logger"], lifetime: "singleton" },
  { token: "UserRepo", deps: ["Db"], lifetime: "transient" },
  { token: "OrderRepo", deps: ["Db", "Logger"], lifetime: "transient" },
  { token: "CheckoutService", deps: ["UserRepo", "OrderRepo", "Logger"], lifetime: "transient" },
];

export const tests: TestCase[] = [
  {
    name: "builds dependencies before dependents",
    args: [app, "Db"],
    expected: { ok: true, created: ["Config#1", "Logger#1", "Db#1"] },
  },
  {
    name: "singletons are shared across the graph",
    args: [app, "CheckoutService"],
    expected: {
      ok: true,
      created: ["Config#1", "Logger#1", "Db#1", "UserRepo#1", "OrderRepo#1", "CheckoutService#1"],
    },
  },
  {
    name: "transients are built every time they are needed",
    args: [
      [
        { token: "Clock", deps: [], lifetime: "transient" },
        { token: "A", deps: ["Clock"], lifetime: "transient" },
        { token: "B", deps: ["Clock", "A"], lifetime: "transient" },
      ],
      "B",
    ],
    expected: { ok: true, created: ["Clock#1", "Clock#2", "A#1", "B#1"] },
  },
  {
    name: "reports a missing dependency and who needed it",
    args: [[{ token: "Mailer", deps: ["SmtpClient"], lifetime: "singleton" }], "Mailer"],
    expected: { ok: false, error: "Missing registration: SmtpClient (required by Mailer)" },
  },
  {
    name: "reports a missing root",
    args: [app, "PaymentGateway"],
    expected: { ok: false, error: "Missing registration: PaymentGateway" },
  },
  {
    name: "reports a cycle with the full path",
    args: [
      [
        { token: "A", deps: ["B"], lifetime: "singleton" },
        { token: "B", deps: ["C"], lifetime: "singleton" },
        { token: "C", deps: ["A"], lifetime: "singleton" },
      ],
      "A",
    ],
    expected: { ok: false, error: "Circular dependency: A -> B -> C -> A" },
  },
  {
    name: "a later registration overrides an earlier one",
    args: [
      [
        { token: "Cache", deps: ["Redis"], lifetime: "singleton" },
        { token: "Cache", deps: [], lifetime: "singleton" },
        { token: "Api", deps: ["Cache"], lifetime: "singleton" },
      ],
      "Api",
    ],
    expected: { ok: true, created: ["Cache#1", "Api#1"] },
  },
  {
    name: "the cycle path starts where the loop begins",
    args: [
      [
        { token: "Root", deps: ["X"], lifetime: "transient" },
        { token: "X", deps: ["Y"], lifetime: "transient" },
        { token: "Y", deps: ["X"], lifetime: "transient" },
      ],
      "Root",
    ],
    expected: { ok: false, error: "Circular dependency: X -> Y -> X" },
    hidden: true,
  },
  {
    name: "a self-dependency is a cycle",
    args: [[{ token: "Loop", deps: ["Loop"], lifetime: "transient" }], "Loop"],
    expected: { ok: false, error: "Circular dependency: Loop -> Loop" },
    hidden: true,
  },
  {
    name: "a diamond builds the shared singleton once and the shared transient twice",
    args: [
      [
        { token: "Shared", deps: [], lifetime: "singleton" },
        { token: "Temp", deps: [], lifetime: "transient" },
        { token: "Left", deps: ["Shared", "Temp"], lifetime: "singleton" },
        { token: "Right", deps: ["Shared", "Temp"], lifetime: "singleton" },
        { token: "Top", deps: ["Left", "Right"], lifetime: "transient" },
      ],
      "Top",
    ],
    expected: { ok: true, created: ["Shared#1", "Temp#1", "Left#1", "Temp#2", "Right#1", "Top#1"] },
    hidden: true,
  },
];
