import type { TestCase } from "@content/_authoring/types";

export const functionName = "tokenBucket";

const at = (...times: number[]) => times.map((t) => ({ t, cost: 1 }));

export const tests: TestCase[] = [
  { name: "allows a burst up to capacity", args: [3, 1, at(0, 0, 0, 0)], expected: [true, true, true, false] },
  {
    name: "refills over time",
    args: [2, 1, at(0, 0, 0, 1000, 1500, 2000)],
    expected: [true, true, false, true, false, true],
  },
  {
    name: "never refills above capacity",
    args: [2, 1, at(0, 0, 10000, 10000, 10000)],
    expected: [true, true, true, true, false],
  },
  {
    name: "requests can cost more than one token",
    args: [
      5,
      1,
      [
        { t: 0, cost: 3 },
        { t: 0, cost: 3 },
        { t: 2000, cost: 3 },
      ],
    ],
    expected: [true, false, true],
  },
  {
    name: "a cost above capacity is always rejected",
    args: [
      2,
      10,
      [
        { t: 0, cost: 3 },
        { t: 0, cost: 1 },
      ],
    ],
    expected: [false, true],
  },
  { name: "no requests", args: [5, 1, []], expected: [] },
  {
    name: "ten tenths of a token make exactly one",
    args: [1, 1, at(0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)],
    expected: [true, false, false, false, false, false, false, false, false, false, true],
    hidden: true,
  },
  {
    name: "rejected requests do not spend tokens",
    args: [1, 4, at(0, 250, 300, 500)],
    expected: [true, true, false, true],
    hidden: true,
  },
];
