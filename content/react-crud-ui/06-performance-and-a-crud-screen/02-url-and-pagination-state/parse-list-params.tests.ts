import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseListParams";

const defaults = { q: "", sort: "createdAt", dir: "desc", page: 1, pageSize: 20 };

export const tests: TestCase[] = [
  {
    name: "an empty URL means all defaults",
    args: ["", 95],
    expected: { state: defaults, totalPages: 5, hasPrev: false, hasNext: true, canonical: "" },
  },
  {
    name: "valid params are kept",
    args: ["?q=desk&sort=price&dir=asc&page=2&pageSize=10", 95],
    expected: {
      state: { q: "desk", sort: "price", dir: "asc", page: 2, pageSize: 10 },
      totalPages: 10,
      hasPrev: true,
      hasNext: true,
      canonical: "?q=desk&sort=price&dir=asc&page=2&pageSize=10",
    },
  },
  {
    name: "junk values fall back to defaults and drop out of the URL",
    args: ["?sort=DROP+TABLE&dir=up&page=-3&pageSize=1000", 95],
    expected: { state: defaults, totalPages: 5, hasPrev: false, hasNext: true, canonical: "" },
  },
  {
    name: "a page past the end is clamped",
    args: ["?page=9", 45],
    expected: {
      state: { q: "", sort: "createdAt", dir: "desc", page: 3, pageSize: 20 },
      totalPages: 3,
      hasPrev: true,
      hasNext: false,
      canonical: "?page=3",
    },
  },
  {
    name: "defaults written explicitly are removed from the canonical URL",
    args: ["?page=1&pageSize=20&sort=createdAt&dir=desc&q=", 10],
    expected: { state: defaults, totalPages: 1, hasPrev: false, hasNext: false, canonical: "" },
  },
  {
    name: "the search text is trimmed and re-encoded; params are reordered",
    args: ["pageSize=50&q=%20standing%20desk%20", 120],
    expected: {
      state: { q: "standing desk", sort: "createdAt", dir: "desc", page: 1, pageSize: 50 },
      totalPages: 3,
      hasPrev: false,
      hasNext: true,
      canonical: "?q=standing+desk&pageSize=50",
    },
  },
  {
    name: "zero items still has one page",
    args: ["?page=4&q=zzz", 0],
    expected: {
      state: { q: "zzz", sort: "createdAt", dir: "desc", page: 1, pageSize: 20 },
      totalPages: 1,
      hasPrev: false,
      hasNext: false,
      canonical: "?q=zzz",
    },
  },
  {
    name: "fractional and exponent numbers are rejected; the first repeat wins",
    args: ["?page=2.5&pageSize=1e1&sort=name&sort=price", 100],
    expected: {
      state: { q: "", sort: "name", dir: "desc", page: 1, pageSize: 20 },
      totalPages: 5,
      hasPrev: false,
      hasNext: true,
      canonical: "?sort=name",
    },
    hidden: true,
  },
  {
    name: "exactly one full page has no next page",
    args: ["?pageSize=10&page=2", 20],
    expected: {
      state: { q: "", sort: "createdAt", dir: "desc", page: 2, pageSize: 10 },
      totalPages: 2,
      hasPrev: true,
      hasNext: false,
      canonical: "?page=2&pageSize=10",
    },
    hidden: true,
  },
];
