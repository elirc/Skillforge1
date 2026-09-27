import type { TestCase } from "@content/_authoring/types";

export const functionName = "buildPageLinks";

const B = "/products";

export const tests: TestCase[] = [
  {
    name: "a middle page has all four links",
    args: [B, 2, 20, 95],
    expected: {
      totalPages: 5,
      link: '</products?page=1&pageSize=20>; rel="first", </products?page=1&pageSize=20>; rel="prev", </products?page=3&pageSize=20>; rel="next", </products?page=5&pageSize=20>; rel="last"',
    },
  },
  {
    name: "the first page has no prev",
    args: [B, 1, 20, 95],
    expected: {
      totalPages: 5,
      link: '</products?page=1&pageSize=20>; rel="first", </products?page=2&pageSize=20>; rel="next", </products?page=5&pageSize=20>; rel="last"',
    },
  },
  {
    name: "the last page has no next",
    args: [B, 5, 20, 95],
    expected: {
      totalPages: 5,
      link: '</products?page=1&pageSize=20>; rel="first", </products?page=4&pageSize=20>; rel="prev", </products?page=5&pageSize=20>; rel="last"',
    },
  },
  {
    name: "an exact multiple does not add an empty page",
    args: [B, 1, 10, 30],
    expected: {
      totalPages: 3,
      link: '</products?page=1&pageSize=10>; rel="first", </products?page=2&pageSize=10>; rel="next", </products?page=3&pageSize=10>; rel="last"',
    },
  },
  {
    name: "an empty list still has one page",
    args: [B, 1, 20, 0],
    expected: { totalPages: 1, link: '</products?page=1&pageSize=20>; rel="first", </products?page=1&pageSize=20>; rel="last"' },
  },
  {
    name: "keeps existing filters in the URL",
    args: ["/products?status=active", 1, 50, 120],
    expected: {
      totalPages: 3,
      link: '</products?status=active&page=1&pageSize=50>; rel="first", </products?status=active&page=2&pageSize=50>; rel="next", </products?status=active&page=3&pageSize=50>; rel="last"',
    },
  },
  {
    name: "a page past the end points prev at the last page",
    args: [B, 9, 20, 45],
    expected: {
      totalPages: 3,
      link: '</products?page=1&pageSize=20>; rel="first", </products?page=3&pageSize=20>; rel="prev", </products?page=3&pageSize=20>; rel="last"',
    },
    hidden: true,
  },
  {
    name: "one item over a full page adds a page",
    args: ["/users/7/orders", 2, 25, 26],
    expected: {
      totalPages: 2,
      link: '</users/7/orders?page=1&pageSize=25>; rel="first", </users/7/orders?page=1&pageSize=25>; rel="prev", </users/7/orders?page=2&pageSize=25>; rel="last"',
    },
    hidden: true,
  },
];
