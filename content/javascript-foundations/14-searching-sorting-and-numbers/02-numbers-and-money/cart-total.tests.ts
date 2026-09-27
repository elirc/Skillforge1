import type { TestCase } from "@content/_authoring/types";

export const functionName = "cartTotal";

export const tests: TestCase[] = [
  { name: "one line", args: [[{ price: "4.99", quantity: 2 }]], expected: "$9.98" },
  {
    name: "cents add up without floating-point drift",
    args: [
      [
        { price: "0.10", quantity: 1 },
        { price: "0.20", quantity: 1 },
      ],
    ],
    expected: "$0.30",
  },
  { name: "whole dollars still show two decimals", args: [[{ price: "5", quantity: 3 }]], expected: "$15.00" },
  { name: "single-digit cents get a leading zero", args: [[{ price: "1.05", quantity: 1 }]], expected: "$1.05" },
  {
    name: "a price that is not a number is skipped",
    args: [
      [
        { price: "free", quantity: 1 },
        { price: "2.50", quantity: 2 },
      ],
    ],
    expected: "$5.00",
  },
  {
    name: "zero, negative, or fractional quantities are skipped",
    args: [
      [
        { price: "3.00", quantity: 0 },
        { price: "3.00", quantity: -1 },
        { price: "3.00", quantity: 1.5 },
        { price: "1.25", quantity: 4 },
      ],
    ],
    expected: "$5.00",
  },
  { name: "an empty cart is $0.00", args: [[]], expected: "$0.00", hidden: true },
  { name: "an empty price string is skipped, not treated as 0", args: [[{ price: "", quantity: 1 }, { price: "19.99", quantity: 3 }]], expected: "$59.97", hidden: true },
];
