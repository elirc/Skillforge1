import type { TestCase } from "@content/_authoring/types";

export const functionName = "isPalindrome";

export const tests: TestCase[] = [
  { name: "accepts a palindrome", args: ["racecar"], expected: true },
  { name: "rejects a non-palindrome", args: ["forge"], expected: false },
  { name: "treats a single character as a palindrome", args: ["a"], expected: true, hidden: true },
];
