import type { TestCase } from "@content/_authoring/types";

export const functionName = "paginate";

const letters = ["a", "b", "c", "d", "e", "f", "g"];

export const tests: TestCase[] = [
  { name: "defaults to page 1 of size 3", args: [letters], expected: { page: 1, totalPages: 3, items: ["a", "b", "c"] } },
  { name: "reads the requested page", args: [letters, 2], expected: { page: 2, totalPages: 3, items: ["d", "e", "f"] } },
  { name: "last page can be short", args: [letters, 3], expected: { page: 3, totalPages: 3, items: ["g"] } },
  { name: "custom page size", args: [letters, 2, 2], expected: { page: 2, totalPages: 4, items: ["c", "d"] } },
  { name: "empty list still has one page", args: [[]], expected: { page: 1, totalPages: 1, items: [] } },
  { name: "clamps a page past the end", args: [letters, 9], expected: { page: 3, totalPages: 3, items: ["g"] }, hidden: true },
  {
    name: "clamps page 0 up to 1",
    args: [letters, 0, 5],
    expected: { page: 1, totalPages: 2, items: ["a", "b", "c", "d", "e"] },
    hidden: true,
  },
];
