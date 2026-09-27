import type { TestCase } from "@content/_authoring/types";

export const functionName = "planInvalidation";

const cache = [
  { key: ["products"], observers: 0 },
  { key: ["products", "list", { page: 1, sort: "name" }], observers: 1 },
  { key: ["products", "list", { page: 2, sort: "name" }], observers: 0 },
  { key: ["products", "detail", 5], observers: 1 },
  { key: ["orders", "list", { page: 1 }], observers: 1 },
];

export const tests: TestCase[] = [
  {
    name: "a prefix invalidates the whole products family",
    args: [cache, { queryKey: ["products"] }],
    expected: {
      refetchNow: ['["products","list",{"page":1,"sort":"name"}]', '["products","detail",5]'],
      markedStale: ['["products"]', '["products","list",{"page":2,"sort":"name"}]'],
      untouched: ['["orders","list",{"page":1}]'],
    },
  },
  {
    name: "after an edit, invalidate every product list but not the detail",
    args: [cache, { queryKey: ["products", "list"] }],
    expected: {
      refetchNow: ['["products","list",{"page":1,"sort":"name"}]'],
      markedStale: ['["products","list",{"page":2,"sort":"name"}]'],
      untouched: ['["products"]', '["products","detail",5]', '["orders","list",{"page":1}]'],
    },
  },
  {
    name: "object elements match partially",
    args: [cache, { queryKey: ["products", "list", { page: 2 }] }],
    expected: {
      refetchNow: [],
      markedStale: ['["products","list",{"page":2,"sort":"name"}]'],
      untouched: [
        '["products"]',
        '["products","list",{"page":1,"sort":"name"}]',
        '["products","detail",5]',
        '["orders","list",{"page":1}]',
      ],
    },
  },
  {
    name: "exact matches only the identical key",
    args: [cache, { queryKey: ["products"], exact: true }],
    expected: {
      refetchNow: [],
      markedStale: ['["products"]'],
      untouched: [
        '["products","list",{"page":1,"sort":"name"}]',
        '["products","list",{"page":2,"sort":"name"}]',
        '["products","detail",5]',
        '["orders","list",{"page":1}]',
      ],
    },
  },
  {
    name: "a longer filter never matches a shorter key",
    args: [[{ key: ["products"], observers: 1 }], { queryKey: ["products", "detail"] }],
    expected: { refetchNow: [], markedStale: [], untouched: ['["products"]'] },
  },
  {
    name: "types must match: the number 5 is not the string 5",
    args: [cache, { queryKey: ["products", "detail", "5"] }],
    expected: {
      refetchNow: [],
      markedStale: [],
      untouched: [
        '["products"]',
        '["products","list",{"page":1,"sort":"name"}]',
        '["products","list",{"page":2,"sort":"name"}]',
        '["products","detail",5]',
        '["orders","list",{"page":1}]',
      ],
    },
  },
  {
    name: "exact ignores object key order",
    args: [
      [{ key: ["products", "list", { sort: "name", page: 1 }], observers: 2 }],
      { queryKey: ["products", "list", { page: 1, sort: "name" }], exact: true },
    ],
    expected: { refetchNow: ['["products","list",{"sort":"name","page":1}]'], markedStale: [], untouched: [] },
    hidden: true,
  },
  {
    name: "an empty filter key matches everything",
    args: [
      [
        { key: ["a"], observers: 0 },
        { key: ["b", 1], observers: 3 },
      ],
      { queryKey: [] },
    ],
    expected: { refetchNow: ['["b",1]'], markedStale: ['["a"]'], untouched: [] },
    hidden: true,
  },
];
