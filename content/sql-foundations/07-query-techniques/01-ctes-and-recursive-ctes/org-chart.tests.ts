import type { TestCase } from "@content/_authoring/types";

export const functionName = "orgChart";

const staff = [
  { id: 1, name: "Ada", managerId: null },
  { id: 2, name: "Ben", managerId: 1 },
  { id: 3, name: "Cy", managerId: 1 },
  { id: 4, name: "Dee", managerId: 2 },
  { id: 5, name: "Eli", managerId: 4 },
  { id: 6, name: "Fay", managerId: null },
];

export const tests: TestCase[] = [
  {
    name: "whole tree from the CEO, ordered by depth then id",
    args: [staff, 1],
    expected: [
      { id: 1, name: "Ada", depth: 0 },
      { id: 2, name: "Ben", depth: 1 },
      { id: 3, name: "Cy", depth: 1 },
      { id: 4, name: "Dee", depth: 2 },
      { id: 5, name: "Eli", depth: 3 },
    ],
  },
  {
    name: "a subtree starts at depth 0 from the chosen root",
    args: [staff, 2],
    expected: [
      { id: 2, name: "Ben", depth: 0 },
      { id: 4, name: "Dee", depth: 1 },
      { id: 5, name: "Eli", depth: 2 },
    ],
  },
  { name: "a leaf returns only itself", args: [staff, 3], expected: [{ id: 3, name: "Cy", depth: 0 }] },
  { name: "an unrelated root does not pull in other trees", args: [staff, 6], expected: [{ id: 6, name: "Fay", depth: 0 }] },
  { name: "unknown root id: the anchor finds no row, so no rows", args: [staff, 99], expected: [] },
  {
    name: "input order does not matter",
    args: [
      [
        { id: 12, name: "Kit", managerId: 10 },
        { id: 11, name: "Jo", managerId: 10 },
        { id: 10, name: "Ivy", managerId: null },
      ],
      10,
    ],
    expected: [
      { id: 10, name: "Ivy", depth: 0 },
      { id: 11, name: "Jo", depth: 1 },
      { id: 12, name: "Kit", depth: 1 },
    ],
  },
  {
    name: "a cycle in bad data is visited once, not forever",
    args: [
      [
        { id: 1, name: "A", managerId: 3 },
        { id: 2, name: "B", managerId: 1 },
        { id: 3, name: "C", managerId: 2 },
      ],
      1,
    ],
    expected: [
      { id: 1, name: "A", depth: 0 },
      { id: 2, name: "B", depth: 1 },
      { id: 3, name: "C", depth: 2 },
    ],
    hidden: true,
  },
  { name: "empty table", args: [[], 1], expected: [], hidden: true },
];
