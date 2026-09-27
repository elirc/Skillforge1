import type { TestCase } from "@content/_authoring/types";

export const functionName = "compareVersions";

export const tests: TestCase[] = [
  { name: "compares parts numerically, not as text", args: ["1.10.0", "1.9.3"], expected: 1 },
  { name: "missing parts count as zero", args: ["1.2", "1.2.0"], expected: 0 },
  { name: "ignores a leading v", args: ["v2.0.1", "2.0.10"], expected: -1 },
  { name: "equal versions", args: ["0.0.1", "0.0.1"], expected: 0 },
  { name: "a major bump beats any minor", args: ["3", "2.99.99"], expected: 1 },
  { name: "an extra non-zero part is newer", args: ["1.0.0", "1.0.0.1"], expected: -1 },
  { name: "two-digit majors", args: ["10.0.0", "9.0.0"], expected: 1, hidden: true },
  { name: "leading zeros do not matter", args: ["1.01", "1.1"], expected: 0, hidden: true },
];
