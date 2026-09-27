import type { TestCase } from "@content/_authoring/types";

export const functionName = "daysUntil";

export const tests: TestCase[] = [
  { name: "the same day is 0 days away", args: ["2026-05-10", "2026-05-10"], expected: 0 },
  { name: "tomorrow is 1 day away", args: ["2026-05-10", "2026-05-11"], expected: 1 },
  { name: "counts across the end of a month", args: ["2026-01-30", "2026-02-02"], expected: 3 },
  { name: "a date in the past gives a negative number", args: ["2026-05-10", "2026-05-03"], expected: -7 },
  { name: "leap years have a February 29", args: ["2028-02-28", "2028-03-01"], expected: 2 },
  { name: "a whole year", args: ["2026-01-01", "2027-01-01"], expected: 365 },
  { name: "the day clocks change is still one whole day", args: ["2026-03-07", "2026-03-09"], expected: 2, hidden: true },
  { name: "an impossible date like February 31 gives null", args: ["2026-02-31", "2026-03-01"], expected: null, hidden: true },
  { name: "text that is not a date gives null", args: ["soon", "2026-03-01"], expected: null, hidden: true },
];
