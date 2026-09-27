import type { TestCase } from "@content/_authoring/types";

export const functionName = "countTags";

export const tests: TestCase[] = [
  { name: "counts repeats", args: [["ts", "js", "ts"]], expected: { ts: 2, js: 1 } },
  { name: "normalizes case and spaces", args: [[" TS", "ts ", "Ts"]], expected: { ts: 3 } },
  { name: "skips blank tags", args: [["", "  ", "sql"]], expected: { sql: 1 } },
  { name: "empty input gives an empty object", args: [[]], expected: {} },
  { name: "keeps first-seen key order", args: [["react", "Node", "react", "node"]], expected: { react: 2, node: 2 }, hidden: true },
];
