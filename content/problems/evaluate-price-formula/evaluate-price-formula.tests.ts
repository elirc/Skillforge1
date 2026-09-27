import type { TestCase } from "@content/_authoring/types";

export const functionName = "evaluateFormula";

export const tests: TestCase[] = [
  {
    name: "evaluates variables",
    args: ["price * qty - discount", { price: 12.5, qty: 4, discount: 5 }],
    expected: 45,
  },
  { name: "multiplication binds tighter than addition", args: ["2 + 3 * 4", {}], expected: 14 },
  { name: "parentheses override precedence", args: ["(2 + 3) * 4", {}], expected: 20 },
  { name: "subtraction is left-associative", args: ["100 - 20 - 5", {}], expected: 75 },
  { name: "division is left-associative", args: ["64 / 4 / 2", {}], expected: 8 },
  { name: "supports unary minus", args: ["-subtotal * 0.5 + 10", { subtotal: 40 }], expected: -10 },
  { name: "an unknown variable is an error", args: ["price * tax", { price: 10 }], expected: null },
  { name: "division by zero is an error", args: ["total / count", { total: 10, count: 0 }], expected: null },
  { name: "unbalanced parentheses are an error", args: ["(1 + 2", {}], expected: null, hidden: true },
  { name: "a stray closing parenthesis is an error", args: ["1 + 2)", {}], expected: null, hidden: true },
  { name: "unary minus nests and follows operators", args: ["--2 * 3 + 2 * -3", {}], expected: 0, hidden: true },
  { name: "prototype names are not variables", args: ["constructor + 1", {}], expected: null, hidden: true },
];
