import type { TestCase } from "@content/_authoring/types";

export const functionName = "childRenders";

export const tests: TestCase[] = [
  {
    name: "without memo, children render with every parent render",
    args: [[{ name: "Row", memo: false }], [{ Row: { title: "A" } }, { Row: { title: "A" } }, { Row: { title: "A" } }]],
    expected: { Row: [1, 2, 3] },
  },
  {
    name: "memo skips renders with equal primitive props",
    args: [[{ name: "Row", memo: true }], [{ Row: { title: "A" } }, { Row: { title: "A" } }, { Row: { title: "B" } }]],
    expected: { Row: [1, 3] },
  },
  {
    name: "an inline arrow function defeats memo",
    args: [
      [{ name: "Row", memo: true }],
      [
        { Row: { title: "A", onSelect: { ref: "fn-r1" } } },
        { Row: { title: "A", onSelect: { ref: "fn-r2" } } },
        { Row: { title: "A", onSelect: { ref: "fn-r3" } } },
      ],
    ],
    expected: { Row: [1, 2, 3] },
  },
  {
    name: "useCallback keeps the function reference stable",
    args: [
      [{ name: "Row", memo: true }],
      [
        { Row: { title: "A", onSelect: { ref: "select" } } },
        { Row: { title: "A", onSelect: { ref: "select" } } },
        { Row: { title: "A", onSelect: { ref: "select" } } },
      ],
    ],
    expected: { Row: [1] },
  },
  {
    name: "memo and non-memo siblings",
    args: [
      [
        { name: "Chart", memo: true },
        { name: "Clock", memo: false },
      ],
      [
        { Chart: { data: { ref: "rows" } }, Clock: { time: "10:00" } },
        { Chart: { data: { ref: "rows" } }, Clock: { time: "10:01" } },
        { Chart: { data: { ref: "rows-v2" } }, Clock: { time: "10:02" } },
      ],
    ],
    expected: { Chart: [1, 3], Clock: [1, 2, 3] },
  },
  {
    name: "adding a prop changes the key count",
    args: [[{ name: "Badge", memo: true }], [{ Badge: { label: "New" } }, { Badge: { label: "New", tone: null } }]],
    expected: { Badge: [1, 2] },
  },
  {
    name: "JSX children are new elements every render",
    args: [
      [{ name: "Card", memo: true }],
      [{ Card: { children: { ref: "jsx-r1" } } }, { Card: { children: { ref: "jsx-r2" } } }],
    ],
    expected: { Card: [1, 2] },
    hidden: true,
  },
  {
    name: "a missing entry means empty props",
    args: [[{ name: "Spinner", memo: true }], [{}, {}, { Spinner: { size: 2 } }, { Spinner: { size: 2 } }]],
    expected: { Spinner: [1, 3] },
    hidden: true,
  },
];
