import type { TestCase } from "@content/_authoring/types";

export const functionName = "Count";

export const tests: TestCase[] = [
  {
    name: "counts paths, busiest first",
    args: [["/home", "/cart", "/home", "/home", "/cart", "/about"]],
    expected: { Counts: ["/home=3", "/cart=2", "/about=1"], Total: 6, LongestPath: 6 },
  },
  {
    name: "query strings, case and trailing slashes are normalized",
    args: [["/Products?page=2", "/products/", " /PRODUCTS ", "/products?sort=price"]],
    expected: { Counts: ["/products=4"], Total: 4, LongestPath: 9 },
  },
  {
    name: "blank lines are ignored",
    args: [["", "   ", "/a"]],
    expected: { Counts: ["/a=1"], Total: 1, LongestPath: 2 },
  },
  {
    name: "the root path keeps its slash",
    args: [["/", "/?utm=x", "/b/"]],
    expected: { Counts: ["/=2", "/b=1"], Total: 3, LongestPath: 2 },
  },
  {
    name: "equal counts are ordered by path",
    args: [["/zeta", "/alpha", "/mid"]],
    expected: { Counts: ["/alpha=1", "/mid=1", "/zeta=1"], Total: 3, LongestPath: 6 },
  },
  {
    name: "no requests",
    args: [[]],
    expected: { Counts: [], Total: 0, LongestPath: 0 },
  },
  {
    name: "thousands of lines add up exactly",
    args: [Array.from({ length: 6000 }, (_, i) => ["/a", "/B/", "/c?x=" + i][i % 3])],
    expected: { Counts: ["/a=2000", "/b=2000", "/c=2000"], Total: 6000, LongestPath: 2 },
    hidden: true,
  },
  {
    name: "LongestPath measures the normalized path, not the raw line",
    args: [["/abc/?verylongquery=123456", "/ab"]],
    expected: { Counts: ["/ab=1", "/abc=1"], Total: 2, LongestPath: 4 },
    hidden: true,
  },
];
