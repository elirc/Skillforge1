import type { TestCase } from "@content/_authoring/types";

export const functionName = "effectLog";

const prod = { strictMode: false, unmountAtEnd: false };

export const tests: TestCase[] = [
  {
    name: "[] runs once on mount",
    args: [[[], [], []], prod],
    expected: ["run 1"],
  },
  {
    name: "no dependency array runs after every render",
    args: [[null, null, null], prod],
    expected: ["run 1", "cleanup 1", "run 2", "cleanup 2", "run 3"],
  },
  {
    name: "[userId] re-runs only when userId changes",
    args: [[[1], [1], [2], [2]], prod],
    expected: ["run 1", "cleanup 1", "run 3"],
  },
  {
    name: "an object created during render is a new dep every time",
    args: [[[{ ref: "options-r1" }], [{ ref: "options-r2" }]], prod],
    expected: ["run 1", "cleanup 1", "run 2"],
  },
  {
    name: "a memoized object keeps the same reference",
    args: [[[{ ref: "options" }], [{ ref: "options" }], [{ ref: "options" }]], prod],
    expected: ["run 1"],
  },
  {
    name: "Strict Mode runs setup, cleanup, setup on mount",
    args: [[["a"], ["a"]], { strictMode: true, unmountAtEnd: false }],
    expected: ["run 1", "cleanup 1", "run 1"],
  },
  {
    name: "unmounting cleans up the last effect that ran",
    args: [[["q"], ["qu"], ["qu"]], { strictMode: false, unmountAtEnd: true }],
    expected: ["run 1", "cleanup 1", "run 2", "cleanup 2"],
  },
  {
    name: "deps compare to the previous render, one element at a time",
    args: [[["books", 1], ["books", 2], ["books", 2], ["films", 2]], prod],
    expected: ["run 1", "cleanup 1", "run 2", "cleanup 2", "run 4"],
    hidden: true,
  },
  {
    name: "strict mode plus unmount",
    args: [[[true], [false]], { strictMode: true, unmountAtEnd: true }],
    expected: ["run 1", "cleanup 1", "run 1", "cleanup 1", "run 2", "cleanup 2"],
    hidden: true,
  },
  {
    name: "the string \"0\" is not the number 0",
    args: [[[0, { ref: "a" }], [0, { ref: "a" }], ["0", { ref: "a" }]], prod],
    expected: ["run 1", "cleanup 1", "run 3"],
    hidden: true,
  },
];
