import type { TestCase } from "@content/_authoring/types";

export const functionName = "uniqueSlug";

export const tests: TestCase[] = [
  { name: "a free slug is returned as-is", args: ["Hello World", []], expected: "hello-world" },
  { name: "a taken slug gets -2", args: ["Hello World", ["hello-world"]], expected: "hello-world-2" },
  {
    name: "keeps counting past taken suffixes",
    args: ["Hello World", ["hello-world", "hello-world-2", "hello-world-3"]],
    expected: "hello-world-4",
  },
  { name: "fills the first gap", args: ["Hello World", ["hello-world", "hello-world-3"]], expected: "hello-world-2" },
  { name: "collapses symbols and trims dashes", args: ["  C# & .NET Tips!! ", []], expected: "c-net-tips" },
  { name: "punctuation-only titles become untitled", args: ["!!!", ["untitled"]], expected: "untitled-2" },
  { name: "only suffixes when the base itself is taken", args: ["Post", ["post-2"]], expected: "post", hidden: true },
  { name: "digits in the base are kept", args: ["Release 2.0", ["release-2-0"]], expected: "release-2-0-2", hidden: true },
];
