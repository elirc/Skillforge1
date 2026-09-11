import type { TestCase } from "@content/_authoring/types";

export const functionName = "CountDueByTag";

// Record arguments are plain JSON objects whose keys are the C# property names,
// and DateTime values are ISO-8601 strings.
const now = "2026-06-16T12:00:00Z";

export const tests: TestCase[] = [
  {
    name: "counts due cards per tag",
    args: [
      [
        { ConceptTag: "linq", DueAt: "2026-06-16T09:00:00Z" },
        { ConceptTag: "linq", DueAt: "2026-06-15T09:00:00Z" },
        { ConceptTag: "async", DueAt: "2026-06-16T11:59:00Z" },
        { ConceptTag: "ef-core", DueAt: "2026-06-17T09:00:00Z" },
      ],
      now,
    ],
    expected: { linq: 2, async: 1 },
  },
  {
    name: "ignores cards that are not due yet",
    args: [[{ ConceptTag: "linq", DueAt: "2026-06-18T09:00:00Z" }], now],
    expected: {},
  },
  {
    name: "treats a card due exactly now as due",
    args: [[{ ConceptTag: "linq", DueAt: now }], now],
    expected: { linq: 1 },
    hidden: true,
  },
  {
    name: "handles an empty queue",
    args: [[], now],
    expected: {},
    hidden: true,
  },
];
