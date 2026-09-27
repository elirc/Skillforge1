import type { TestCase } from "@content/_authoring/types";

export const functionName = "debounceTimeline";

const steady = Array.from({ length: 11 }, (_, i) => ({ t: i * 100, value: `q${i}` }));

export const tests: TestCase[] = [
  {
    name: "one burst fires once with the latest value",
    args: [
      [
        { t: 0, value: "r" },
        { t: 100, value: "re" },
        { t: 200, value: "rea" },
        { t: 250, value: "reac" },
        { t: 300, value: "react" },
      ],
      300,
      null,
    ],
    expected: [{ t: 600, value: "react" }],
  },
  {
    name: "a quiet gap splits two bursts",
    args: [
      [
        { t: 0, value: "a" },
        { t: 100, value: "ab" },
        { t: 1000, value: "abc" },
      ],
      300,
      null,
    ],
    expected: [
      { t: 400, value: "ab" },
      { t: 1300, value: "abc" },
    ],
  },
  {
    name: "maxWait forces calls during steady typing",
    args: [steady, 300, 500],
    expected: [
      { t: 500, value: "q4" },
      { t: 1000, value: "q9" },
      { t: 1300, value: "q10" },
    ],
  },
  {
    name: "a timer due at the same millisecond fires first",
    args: [
      [
        { t: 0, value: "a" },
        { t: 300, value: "b" },
      ],
      300,
      null,
    ],
    expected: [
      { t: 300, value: "a" },
      { t: 600, value: "b" },
    ],
  },
  { name: "no events means no calls", args: [[], 300, 500], expected: [] },
  {
    name: "a generous maxWait changes nothing",
    args: [
      [
        { t: 0, value: "a" },
        { t: 100, value: "b" },
      ],
      200,
      1000,
    ],
    expected: [{ t: 300, value: "b" }],
  },
  {
    name: "the same value in two bursts fires twice",
    args: [
      [
        { t: 0, value: "x" },
        { t: 500, value: "x" },
      ],
      100,
      null,
    ],
    expected: [
      { t: 100, value: "x" },
      { t: 600, value: "x" },
    ],
    hidden: true,
  },
  {
    name: "maxWait restarts from the first event of the next burst",
    args: [
      [
        { t: 0, value: "a" },
        { t: 150, value: "b" },
        { t: 300, value: "c" },
      ],
      200,
      250,
    ],
    expected: [
      { t: 250, value: "b" },
      { t: 500, value: "c" },
    ],
    hidden: true,
  },
  {
    name: "maxWait shorter than wait",
    args: [
      [
        { t: 0, value: "a" },
        { t: 200, value: "b" },
        { t: 400, value: "c" },
        { t: 600, value: "d" },
      ],
      1000,
      300,
    ],
    expected: [
      { t: 300, value: "b" },
      { t: 700, value: "d" },
    ],
    hidden: true,
  },
];
