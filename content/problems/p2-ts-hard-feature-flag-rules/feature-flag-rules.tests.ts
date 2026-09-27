import type { TestCase } from "@content/_authoring/types";

export const functionName = "evaluateRule";

const user = { country: "US", plan: "pro", age: 34, beta: true };
const yes = { ok: true, value: true };
const no = { ok: true, value: false };

export const tests: TestCase[] = [
  { name: "a simple equality", args: ["country = US", user], expected: yes },
  { name: "in-list and inequality", args: ["country in [US, CA] and plan != free", user], expected: yes },
  { name: "not negates a comparison", args: ["not beta = true", user], expected: no },
  { name: "parentheses group an or", args: ["age >= 18 and (plan = free or country = DE)", user], expected: no },
  { name: "and binds tighter than or", args: ["country = US or plan = free and age < 30", user], expected: yes },
  { name: "a missing attribute never matches", args: ["team = core or not team != core", user], expected: yes },
  { name: "a dangling operator", args: ["country = ", user], expected: { ok: false, error: "unexpected end of rule" } },
  { name: "an unclosed list", args: ["country in [US", user], expected: { ok: false, error: "unexpected end of rule" } },
  { name: "a missing operator", args: ["plan pro", user], expected: { ok: false, error: 'unexpected "pro"' } },
  { name: "double negation", args: ["NOT not beta = true", user], expected: yes, hidden: true },
  { name: "a stray closing parenthesis", args: ["plan = pro)", user], expected: { ok: false, error: 'unexpected ")"' }, hidden: true },
  { name: "a trailing and", args: ["plan = pro and", user], expected: { ok: false, error: "unexpected end of rule" }, hidden: true },
  { name: "non-numeric comparisons are false", args: ["age > abc", user], expected: no, hidden: true },
];
