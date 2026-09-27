import type { TestCase } from "@content/_authoring/types";

export const functionName = "runPipeline";

export const tests: TestCase[] = [
  {
    name: "trim, lower, slug run left to right",
    args: ["  Hello, World!  ", ["trim", "lower", "slug"]],
    expected: { ok: true, value: "hello-world" },
  },
  {
    name: "order matters: slug before lower treats capitals as separators",
    args: ["Hi There", ["slug", "lower"]],
    expected: { ok: true, value: "i-here" },
  },
  {
    name: "configured steps take an argument",
    args: ["  A Very Long Blog Post Title ", ["trim", "lower", "slug", ["truncate", 11], ["prefix", "post-"]]],
    expected: { ok: true, value: "post-a-very-long" },
  },
  {
    name: "upper is available",
    args: ["abc", ["upper", ["prefix", "id-"]]],
    expected: { ok: true, value: "id-ABC" },
  },
  {
    name: "no steps returns the input unchanged",
    args: ["  as is ", []],
    expected: { ok: true, value: "  as is " },
  },
  {
    name: "an unknown step is reported instead of crashing",
    args: ["x", ["trim", "reverse"]],
    expected: { ok: false, error: "unknown step: reverse" },
  },
  {
    name: "an unknown configured step is reported too",
    args: ["x", [["pad", 3]]],
    expected: { ok: false, error: "unknown step: pad" },
    hidden: true,
  },
  {
    name: "prefix then truncate differs from truncate then prefix",
    args: ["abcdef", [["prefix", ">>"], ["truncate", 4]]],
    expected: { ok: true, value: ">>ab" },
    hidden: true,
  },
];
