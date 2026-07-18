import type { TestCase } from "@content/_authoring/types";

export const functionName = "fizzbuzz";

export const tests: TestCase[] = [
  { name: "covers 1..5", args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
  { name: "marks FizzBuzz at 15", args: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"], hidden: true },
];
