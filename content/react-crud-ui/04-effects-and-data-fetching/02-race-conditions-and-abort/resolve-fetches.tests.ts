import type { TestCase } from "@content/_authoring/types";

export const functionName = "resolveFetches";

// The user types "re" then "react"; the "re" request is slow and answers last.
const outOfOrder = [
  { type: "request", id: 1, query: "re" },
  { type: "request", id: 2, query: "react" },
  { type: "response", id: 2, results: ["react", "react-dom"] },
  { type: "response", id: 1, results: ["redux", "remix", "react"] },
];

export const tests: TestCase[] = [
  {
    name: "naive: the stale response wins",
    args: [outOfOrder, "naive"],
    expected: { shown: { query: "re", results: ["redux", "remix", "react"] }, aborted: [], applied: [2, 1] },
  },
  {
    name: "abort: the stale response is ignored",
    args: [outOfOrder, "abort"],
    expected: { shown: { query: "react", results: ["react", "react-dom"] }, aborted: [1], applied: [2] },
  },
  {
    name: "in-order responses look the same in both modes",
    args: [
      [
        { type: "request", id: 1, query: "a" },
        { type: "response", id: 1, results: ["apple"] },
        { type: "request", id: 2, query: "ab" },
        { type: "response", id: 2, results: ["abacus"] },
      ],
      "abort",
    ],
    expected: { shown: { query: "ab", results: ["abacus"] }, aborted: [], applied: [1, 2] },
  },
  {
    name: "nothing answered yet",
    args: [[{ type: "request", id: 1, query: "x" }], "abort"],
    expected: { shown: null, aborted: [], applied: [] },
  },
  {
    name: "fast typing aborts every older request",
    args: [
      [
        { type: "request", id: 1, query: "d" },
        { type: "request", id: 2, query: "de" },
        { type: "request", id: 3, query: "des" },
        { type: "response", id: 1, results: ["dog"] },
        { type: "response", id: 3, results: ["desk"] },
      ],
      "abort",
    ],
    expected: { shown: { query: "des", results: ["desk"] }, aborted: [1, 2], applied: [3] },
  },
  {
    name: "a duplicate response is ignored",
    args: [
      [
        { type: "request", id: 1, query: "a" },
        { type: "response", id: 1, results: ["apple"] },
        { type: "response", id: 1, results: ["avocado"] },
      ],
      "naive",
    ],
    expected: { shown: { query: "a", results: ["apple"] }, aborted: [], applied: [1] },
  },
  {
    name: "an answered request is not aborted later",
    args: [
      [
        { type: "request", id: 1, query: "a" },
        { type: "response", id: 1, results: ["apple"] },
        { type: "request", id: 2, query: "b" },
        { type: "request", id: 3, query: "c" },
        { type: "response", id: 2, results: ["banana"] },
      ],
      "abort",
    ],
    expected: { shown: { query: "a", results: ["apple"] }, aborted: [2], applied: [1] },
    hidden: true,
  },
  {
    name: "naive mode with three overlapping requests",
    args: [
      [
        { type: "request", id: 1, query: "d" },
        { type: "request", id: 2, query: "de" },
        { type: "request", id: 3, query: "des" },
        { type: "response", id: 3, results: ["desk"] },
        { type: "response", id: 2, results: ["delta"] },
        { type: "response", id: 9, results: ["unknown"] },
      ],
      "naive",
    ],
    expected: { shown: { query: "de", results: ["delta"] }, aborted: [], applied: [3, 2] },
    hidden: true,
  },
];
