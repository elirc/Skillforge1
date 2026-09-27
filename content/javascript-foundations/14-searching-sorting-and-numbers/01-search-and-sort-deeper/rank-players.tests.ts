import type { TestCase } from "@content/_authoring/types";

export const functionName = "rankPlayers";

export const tests: TestCase[] = [
  {
    name: "highest score first",
    args: [
      [
        { name: "Ada", score: 40 },
        { name: "Ben", score: 90 },
        { name: "Cy", score: 65 },
      ],
    ],
    expected: ["Ben", "Cy", "Ada"],
  },
  {
    name: "numbers sort as numbers, not text (9 is less than 10)",
    args: [
      [
        { name: "Nia", score: 9 },
        { name: "Ola", score: 10 },
        { name: "Pip", score: 100 },
      ],
    ],
    expected: ["Pip", "Ola", "Nia"],
  },
  {
    name: "ties are broken by name A to Z",
    args: [
      [
        { name: "Zoe", score: 50 },
        { name: "Amy", score: 50 },
        { name: "Max", score: 50 },
      ],
    ],
    expected: ["Amy", "Max", "Zoe"],
  },
  {
    name: "mixes score order and name tie-breaks",
    args: [
      [
        { name: "Dan", score: 70 },
        { name: "Bea", score: 80 },
        { name: "Cal", score: 70 },
      ],
    ],
    expected: ["Bea", "Cal", "Dan"],
  },
  { name: "one player", args: [[{ name: "Solo", score: 1 }]], expected: ["Solo"] },
  {
    name: "zero and negative scores",
    args: [
      [
        { name: "Neg", score: -5 },
        { name: "Zero", score: 0 },
      ],
    ],
    expected: ["Zero", "Neg"],
  },
  { name: "no players", args: [[]], expected: [], hidden: true },
];
