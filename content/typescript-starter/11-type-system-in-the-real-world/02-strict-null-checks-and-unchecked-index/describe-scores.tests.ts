import type { TestCase } from "@content/_authoring/types";

export const functionName = "describeScores";

export const tests: TestCase[] = [
  {
    name: "a player with scores gets best, first, and last",
    args: [{ ada: [3, 9, 7] }, ["ada"]],
    expected: ["ada: best 9, first 3, last 7"],
  },
  {
    name: "a missing player has no record",
    args: [{ ada: [1] }, ["lin"]],
    expected: ["lin: no record"],
  },
  {
    name: "an empty list means no attempts",
    args: [{ lin: [] }, ["lin"]],
    expected: ["lin: no attempts"],
  },
  {
    name: "a single score is both first and last",
    args: [{ bo: [5] }, ["bo"]],
    expected: ["bo: best 5, first 5, last 5"],
  },
  {
    name: "a zero score is a real score",
    args: [{ zed: [0, 0] }, ["zed"]],
    expected: ["zed: best 0, first 0, last 0"],
  },
  {
    name: "names are answered in the order asked",
    args: [{ a: [1, 2], b: [] }, ["b", "c", "a"]],
    expected: ["b: no attempts", "c: no record", "a: best 2, first 1, last 2"],
  },
  {
    name: "inherited keys are not players",
    args: [{ ada: [1] }, ["toString"]],
    expected: ["toString: no record"],
    hidden: true,
  },
  {
    name: "negative scores",
    args: [{ neg: [-5, -2, -9] }, ["neg"]],
    expected: ["neg: best -2, first -5, last -9"],
    hidden: true,
  },
];
