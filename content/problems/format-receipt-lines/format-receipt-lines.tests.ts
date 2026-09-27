import type { TestCase } from "@content/_authoring/types";

export const functionName = "formatReceipt";

// `row(left, right)` is a 20-column line with `right` flush against the right edge.
const row = (left: string, right: string) => left + " ".repeat(20 - left.length - right.length) + right;
const dashes = "-".repeat(20);

export const tests: TestCase[] = [
  {
    name: "prints one short item and the total",
    args: [[{ name: "Coffee", cents: 350 }], 20],
    expected: [row("Coffee", "$3.50"), dashes, row("TOTAL", "$3.50")],
  },
  {
    name: "wraps a long name and moves the price to its own line when needed",
    args: [[{ name: "Large oat milk latte with extra shot", cents: 625 }], 20],
    expected: ["Large oat milk latte", "with extra shot", "$6.25".padStart(20), dashes, row("TOTAL", "$6.25")],
  },
  {
    name: "splits a word longer than the line",
    args: [[{ name: "Supercalifragilisticexpialidocious", cents: 100 }], 20],
    expected: ["Supercalifragilistic", row("expialidocious", "$1.00"), dashes, row("TOTAL", "$1.00")],
  },
  {
    name: "sums several items",
    args: [
      [
        { name: "Tea", cents: 250 },
        { name: "Bagel", cents: 1299 },
      ],
      20,
    ],
    expected: [row("Tea", "$2.50"), row("Bagel", "$12.99"), dashes, row("TOTAL", "$15.49")],
  },
  {
    name: "collapses extra whitespace in names",
    args: [[{ name: "  Iced   tea  ", cents: 400 }], 20],
    expected: [row("Iced tea", "$4.00"), dashes, row("TOTAL", "$4.00")],
  },
  { name: "an empty receipt still has a total", args: [[], 20], expected: [dashes, row("TOTAL", "$0.00")] },
  {
    name: "pads small amounts and prints large ones",
    args: [
      [
        { name: "Mint", cents: 5 },
        { name: "Espresso machine", cents: 100000 },
      ],
      20,
    ],
    expected: [row("Mint", "$0.05"), "Espresso machine", "$1000.00".padStart(20), dashes, row("TOTAL", "$1000.05")],
    hidden: true,
  },
  {
    name: "a word can follow the last chunk of a split word",
    args: [[{ name: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ab", cents: 100 }], 20],
    expected: ["ABCDEFGHIJKLMNOPQRST", row("UVWXYZ ab", "$1.00"), dashes, row("TOTAL", "$1.00")],
    hidden: true,
  },
];
