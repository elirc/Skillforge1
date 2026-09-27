import type { TestCase } from "@content/_authoring/types";

export const functionName = "autocomplete";

const history = [
  { term: "react hooks", count: 50 },
  { term: "react router", count: 30 },
  { term: "redux", count: 30 },
  { term: "rest api", count: 10 },
  { term: "React Hooks", count: 5 },
  { term: "ruby", count: 8 },
];

export const tests: TestCase[] = [
  {
    name: "ranks by count, then alphabetically",
    args: [history, ["re"], 3],
    expected: [["react hooks", "react router", "redux"]],
  },
  {
    name: "normalizes the prefix",
    args: [history, ["  REACT "], 5],
    expected: [["react hooks", "react router"]],
  },
  { name: "no match returns an empty list", args: [history, ["vue"], 3], expected: [[]] },
  { name: "respects k", args: [history, ["r"], 1], expected: [["react hooks"]] },
  {
    name: "answers several queries",
    args: [history, ["ru", "rest"], 3],
    expected: [["ruby"], ["rest api"]],
  },
  { name: "a full term is its own prefix", args: [history, ["redux"], 3], expected: [["redux"]] },
  { name: "an empty prefix suggests nothing", args: [history, ["   "], 3], expected: [[]], hidden: true },
  {
    name: "returns a term that is a prefix of another term",
    args: [
      [
        { term: "java", count: 5 },
        { term: "javascript", count: 9 },
      ],
      ["java"],
      5,
    ],
    expected: [["javascript", "java"]],
    hidden: true,
  },
  {
    name: "merges counts across letter case before ranking",
    args: [
      [
        { term: "SQL joins", count: 4 },
        { term: "sql indexes", count: 6 },
        { term: "sql JOINS", count: 4 },
      ],
      ["sql"],
      2,
    ],
    expected: [["sql joins", "sql indexes"]],
    hidden: true,
  },
];
