import type { TestCase } from "@content/_authoring/types";

export const functionName = "rateLimit";

export const tests: TestCase[] = [
  {
    name: "counts down the remaining quota",
    args: [[{ client: "a", at: 0 }, { client: "a", at: 1 }, { client: "a", at: 2 }], 3, 60],
    expected: [
      { status: 200, remaining: 2 },
      { status: 200, remaining: 1 },
      { status: 200, remaining: 0 },
    ],
  },
  {
    name: "rejects over the limit with Retry-After",
    args: [[{ client: "a", at: 10 }, { client: "a", at: 20 }, { client: "a", at: 45 }], 2, 60],
    expected: [{ status: 200, remaining: 1 }, { status: 200, remaining: 0 }, { status: 429, retryAfter: 15 }],
  },
  {
    name: "a new window resets the counter",
    args: [[{ client: "a", at: 58 }, { client: "a", at: 59 }, { client: "a", at: 60 }], 1, 60],
    expected: [{ status: 200, remaining: 0 }, { status: 429, retryAfter: 1 }, { status: 200, remaining: 0 }],
  },
  {
    name: "each client has its own quota",
    args: [[{ client: "a", at: 5 }, { client: "b", at: 6 }, { client: "a", at: 7 }], 1, 60],
    expected: [{ status: 200, remaining: 0 }, { status: 200, remaining: 0 }, { status: 429, retryAfter: 53 }],
  },
  { name: "no calls, no results", args: [[], 10, 60], expected: [] },
  {
    name: "rejected calls do not count, and the next window starts fresh",
    args: [[{ client: "k", at: 100 }, { client: "k", at: 101 }, { client: "k", at: 102 }, { client: "k", at: 110 }, { client: "k", at: 111 }], 1, 10],
    expected: [
      { status: 200, remaining: 0 },
      { status: 429, retryAfter: 9 },
      { status: 429, retryAfter: 8 },
      { status: 200, remaining: 0 },
      { status: 429, retryAfter: 9 },
    ],
  },
  {
    name: "the fixed-window burst: 2x limit across a boundary",
    args: [[{ client: "a", at: 59 }, { client: "a", at: 59 }, { client: "a", at: 60 }, { client: "a", at: 60 }], 2, 60],
    expected: [
      { status: 200, remaining: 1 },
      { status: 200, remaining: 0 },
      { status: 200, remaining: 1 },
      { status: 200, remaining: 0 },
    ],
    hidden: true,
  },
  {
    name: "windows are aligned to multiples of the window size",
    args: [[{ client: "a", at: 125 }, { client: "a", at: 126 }], 1, 30],
    expected: [{ status: 200, remaining: 0 }, { status: 429, retryAfter: 24 }],
    hidden: true,
  },
];
