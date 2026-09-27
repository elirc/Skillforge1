import type { TestCase } from "@content/_authoring/types";

export const functionName = "resolveSiblings";

export const tests: TestCase[] = [
  {
    name: "a linear history keeps only the newest version",
    args: [
      [
        { id: "v1", clock: { phone: 1 } },
        { id: "v2", clock: { phone: 2 } },
        { id: "v3", clock: { phone: 2, laptop: 1 } },
      ],
    ],
    expected: { siblings: ["v3"], clock: { laptop: 1, phone: 2 } },
  },
  {
    name: "concurrent writes are both kept",
    args: [
      [
        { id: "v1", clock: { a: 2, b: 1 } },
        { id: "v2", clock: { a: 1, b: 2 } },
      ],
    ],
    expected: { siblings: ["v1", "v2"], clock: { a: 2, b: 2 } },
  },
  {
    name: "drops a stale version but keeps a concurrent one",
    args: [
      [
        { id: "v1", clock: { a: 1 } },
        { id: "v2", clock: { a: 2 } },
        { id: "v3", clock: { a: 1, b: 1 } },
      ],
    ],
    expected: { siblings: ["v2", "v3"], clock: { a: 2, b: 1 } },
  },
  {
    name: "a missing replica counts as zero",
    args: [
      [
        { id: "v1", clock: { b: 1 } },
        { id: "v2", clock: { a: 1, b: 1 } },
      ],
    ],
    expected: { siblings: ["v2"], clock: { a: 1, b: 1 } },
  },
  {
    name: "equal clocks keep only the first version",
    args: [
      [
        { id: "v1", clock: { a: 1, b: 1 } },
        { id: "v2", clock: { b: 1, a: 1 } },
      ],
    ],
    expected: { siblings: ["v1"], clock: { a: 1, b: 1 } },
  },
  { name: "no versions", args: [[]], expected: { siblings: [], clock: {} } },
  {
    name: "three-way conflict with one obsolete version",
    args: [
      [
        { id: "x", clock: { a: 3 } },
        { id: "y", clock: { b: 3 } },
        { id: "z", clock: { c: 1 } },
        { id: "w", clock: { a: 3, b: 1 } },
      ],
    ],
    expected: { siblings: ["y", "z", "w"], clock: { a: 3, b: 3, c: 1 } },
    hidden: true,
  },
  {
    name: "an explicit zero equals a missing counter",
    args: [
      [
        { id: "v1", clock: { a: 1, b: 0 } },
        { id: "v2", clock: { a: 1 } },
      ],
    ],
    expected: { siblings: ["v1"], clock: { a: 1 } },
    hidden: true,
  },
  {
    name: "merged clock keys are sorted",
    args: [
      [
        { id: "v1", clock: { zulu: 1 } },
        { id: "v2", clock: { mike: 2 } },
      ],
    ],
    expected: { siblings: ["v1", "v2"], clock: { mike: 2, zulu: 1 } },
    hidden: true,
  },
];
