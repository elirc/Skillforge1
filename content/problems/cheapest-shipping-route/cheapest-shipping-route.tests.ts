import type { TestCase } from "@content/_authoring/types";

export const functionName = "cheapestRoute";

const network = [
  ["SEA", "PDX", 4],
  ["SEA", "BOI", 9],
  ["PDX", "BOI", 3],
  ["PDX", "SFO", 11],
  ["BOI", "SLC", 2],
  ["SLC", "SFO", 5],
  ["SFO", "LAX", 3],
];

export const tests: TestCase[] = [
  {
    name: "takes a longer path when it is cheaper",
    args: [network, "SEA", "SFO", []],
    expected: { cost: 14, path: ["SEA", "PDX", "BOI", "SLC", "SFO"] },
  },
  {
    name: "fewest hops is not the goal",
    args: [
      [
        ["A", "D", 10],
        ["A", "B", 1],
        ["B", "C", 1],
        ["C", "D", 1],
      ],
      "A",
      "D",
      [],
    ],
    expected: { cost: 3, path: ["A", "B", "C", "D"] },
  },
  {
    name: "routes around a closed warehouse",
    args: [network, "SEA", "SFO", ["SLC"]],
    expected: { cost: 15, path: ["SEA", "PDX", "SFO"] },
  },
  {
    name: "lanes are one-way",
    args: [network, "LAX", "SEA", []],
    expected: null,
  },
  {
    name: "start equals goal costs nothing",
    args: [network, "PDX", "PDX", []],
    expected: { cost: 0, path: ["PDX"] },
  },
  {
    name: "a closed destination is unreachable",
    args: [network, "SEA", "LAX", ["LAX"]],
    expected: null,
  },
  {
    name: "keeps the cheaper of two parallel lanes",
    args: [
      [
        ["A", "B", 7],
        ["A", "B", 2],
        ["B", "C", 1],
      ],
      "A",
      "C",
      [],
    ],
    expected: { cost: 3, path: ["A", "B", "C"] },
    hidden: true,
  },
  {
    name: "zero-cost lanes are allowed",
    args: [
      [
        ["A", "B", 0],
        ["B", "C", 0],
        ["A", "C", 1],
      ],
      "A",
      "C",
      [],
    ],
    expected: { cost: 0, path: ["A", "B", "C"] },
    hidden: true,
  },
  {
    name: "a closed start means no route",
    args: [network, "SEA", "PDX", ["SEA"]],
    expected: null,
    hidden: true,
  },
  {
    name: "a node missing from the graph is unreachable",
    args: [network, "SEA", "NYC", []],
    expected: null,
    hidden: true,
  },
];
