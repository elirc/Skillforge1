import type { TestCase } from "@content/_authoring/types";

export const functionName = "validateSignup";

const valid = {
  email: "ada@example.com",
  displayName: "Ada",
  password: "analytical1",
  confirmPassword: "analytical1",
  age: "",
};

export const tests: TestCase[] = [
  { name: "a valid form has no errors", args: [valid], expected: {} },
  {
    name: "a blank email is required",
    args: [{ ...valid, email: "  " }],
    expected: { email: "Email is required" },
  },
  {
    name: "an email without a domain dot is invalid",
    args: [{ ...valid, email: "ada@example" }],
    expected: { email: "Enter a valid email" },
  },
  {
    name: "a short password reports length first",
    args: [{ ...valid, password: "abc", confirmPassword: "abc" }],
    expected: { password: "Password must be at least 8 characters" },
  },
  {
    name: "a long password still needs a digit",
    args: [{ ...valid, password: "analytical", confirmPassword: "analytical" }],
    expected: { password: "Password must contain a number" },
  },
  {
    name: "reports every broken field, keyed by field, in form order",
    args: [{ email: "", displayName: "A", password: "short", confirmPassword: "other", age: "9" }],
    expected: {
      email: "Email is required",
      displayName: "Display name must be 2-30 characters",
      password: "Password must be at least 8 characters",
      confirmPassword: "Passwords do not match",
      age: "Age must be a whole number from 13 to 120",
    },
  },
  {
    name: "a valid age passes",
    args: [{ ...valid, age: "42" }],
    expected: {},
  },
  {
    name: "a fractional age fails",
    args: [{ ...valid, age: "20.5" }],
    expected: { age: "Age must be a whole number from 13 to 120" },
    hidden: true,
  },
  {
    name: "display name is measured after trimming",
    args: [{ ...valid, displayName: "  B  " }],
    expected: { displayName: "Display name must be 2-30 characters" },
    hidden: true,
  },
  {
    name: "a mismatched confirmation alone",
    args: [{ ...valid, confirmPassword: "analytical2" }],
    expected: { confirmPassword: "Passwords do not match" },
    hidden: true,
  },
];
