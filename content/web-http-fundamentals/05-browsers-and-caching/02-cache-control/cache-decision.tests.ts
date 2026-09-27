import type { TestCase } from "@content/_authoring/types";

export const functionName = "cacheDecision";

export const tests: TestCase[] = [
  { name: "young enough is fresh", args: ["public, max-age=300", 120, true], expected: "fresh" },
  { name: "older than max-age must revalidate", args: ["public, max-age=300", 300, false], expected: "revalidate" },
  { name: "no-store is never stored", args: ["no-store", 0, false], expected: "do-not-store" },
  { name: "private responses stay out of shared caches", args: ["private, max-age=600", 10, true], expected: "do-not-store" },
  { name: "private responses may live in the browser", args: ["private, max-age=600", 10, false], expected: "fresh" },
  { name: "no-cache always revalidates", args: ["no-cache, max-age=3600", 1, false], expected: "revalidate" },
  { name: "s-maxage overrides max-age for a CDN", args: ["max-age=60, s-maxage=3600", 600, true], expected: "fresh" },
  { name: "s-maxage is ignored by a browser", args: ["max-age=60, s-maxage=3600", 600, false], expected: "revalidate", hidden: true },
  { name: "names are case-insensitive and values may be quoted", args: ['Public, Max-Age="90"', 30, true], expected: "fresh", hidden: true },
  { name: "no lifetime means revalidate", args: ["public", 0, true], expected: "revalidate", hidden: true },
];
