import type { TestCase } from "@content/_authoring/types";

export const functionName = "seekPrefixLength";

const index = ["tenant_id", "created_at", "status"];

export const tests: TestCase[] = [
  { name: "equality then range uses two columns", args: [index, ["tenant_id"], "created_at"], expected: 2 },
  { name: "a skipped middle column stops the prefix", args: [index, ["tenant_id", "status"], null], expected: 1 },
  { name: "no predicate on the leading column means a scan", args: [index, ["status"], "created_at"], expected: 0 },
  { name: "equality on every key column uses all of them", args: [index, ["status", "created_at", "tenant_id"], null], expected: 3 },
  {
    name: "columns after a range column are not used for the seek",
    args: [["a", "b", "c"], ["a", "c"], "b"],
    expected: 2,
    hidden: true,
  },
  { name: "a range on the leading column uses just that column", args: [["price", "id"], [], "price"], expected: 1, hidden: true },
  { name: "predicates on non-indexed columns do not help", args: [["email"], ["name"], "age"], expected: 0, hidden: true },
];
