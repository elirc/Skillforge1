import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseDuration";

export const tests: TestCase[] = [
  { name: "hours and minutes", args: ["1h30m"], expected: 5400 },
  { name: "seconds only", args: ["45s"], expected: 45 },
  { name: "days", args: ["2d"], expected: 172800 },
  { name: "spaces between parts", args: ["1h 15m 10s"], expected: 4510 },
  { name: "more than 60 minutes is fine", args: ["90m"], expected: 5400 },
  { name: "out-of-order units are invalid", args: ["1m1h"], expected: null },
  { name: "garbage is invalid", args: ["abc"], expected: null },
  { name: "empty text is invalid", args: [""], expected: null },
  { name: "units are case-insensitive", args: ["1H"], expected: 3600, hidden: true },
  { name: "a repeated unit is invalid", args: ["1h1h"], expected: null, hidden: true },
  { name: "a bare number is invalid", args: ["10"], expected: null, hidden: true },
  { name: "surrounding spaces are trimmed", args: [" 5m "], expected: 300, hidden: true },
];
