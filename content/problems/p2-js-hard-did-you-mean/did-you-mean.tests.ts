import type { TestCase } from "@content/_authoring/types";

export const functionName = "suggest";

const git = ["commit", "checkout", "cherry-pick", "clone", "config", "status", "stash", "push", "pull"];

export const tests: TestCase[] = [
  { name: "one missing letter", args: ["comit", git], expected: ["commit"] },
  { name: "stats is closer to status than stash", args: ["stats", git], expected: ["status"] },
  { name: "one wrong letter", args: ["pusj", git], expected: ["push"] },
  { name: "short input still allows one edit", args: ["pul", git], expected: ["pull"] },
  { name: "an exact match suggests nothing", args: ["CLONE", git], expected: [] },
  { name: "nothing close enough", args: ["xyz", git], expected: [] },
  { name: "longer input allows more edits", args: ["chekout", git], expected: ["checkout"] },
  {
    name: "ties are alphabetical and capped at three",
    args: ["at", ["rat", "mat", "Hat", "cat", "bat"]],
    expected: ["bat", "cat", "Hat"],
  },
  { name: "a transposition costs two edits", args: ["Psuh", git], expected: [], hidden: true },
  { name: "input is trimmed before measuring", args: ["  Stauts ", git], expected: ["status"], hidden: true },
];
