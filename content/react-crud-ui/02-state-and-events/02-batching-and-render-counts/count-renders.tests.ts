import type { TestCase } from "@content/_authoring/types";

export const functionName = "countRenders";

const form = { name: "", saving: false, error: null };

export const tests: TestCase[] = [
  {
    name: "three setState calls in one click render once",
    args: [
      form,
      [
        [
          { key: "saving", op: "set", value: true },
          { key: "error", op: "set", value: null },
          { key: "name", op: "set", value: "Desk" },
        ],
      ],
    ],
    expected: { renders: 1, state: { name: "Desk", saving: true, error: null } },
  },
  {
    name: "two separate events render twice",
    args: [{ count: 0 }, [[{ key: "count", op: "add", delta: 1 }], [{ key: "count", op: "add", delta: 1 }]]],
    expected: { renders: 2, state: { count: 2 } },
  },
  {
    name: "setting the same value skips the render",
    args: [{ tab: "list" }, [[{ key: "tab", op: "set", value: "list" }]]],
    expected: { renders: 0, state: { tab: "list" } },
  },
  {
    name: "toggling on and off in one event ends equal, so no render",
    args: [{ open: false }, [[{ key: "open", op: "set", value: true }, { key: "open", op: "set", value: false }]]],
    expected: { renders: 0, state: { open: false } },
  },
  {
    name: "a fetch callback that sets data and loading is one batch",
    args: [
      { loading: true, total: 0 },
      [
        [
          { key: "total", op: "set", value: 42 },
          { key: "loading", op: "set", value: false },
        ],
      ],
    ],
    expected: { renders: 1, state: { loading: false, total: 42 } },
  },
  {
    name: "an event with no setState calls does not render",
    args: [{ count: 3 }, [[], [{ key: "count", op: "add", delta: 0 }]]],
    expected: { renders: 0, state: { count: 3 } },
  },
  {
    name: "mixed events",
    args: [
      { count: 0, label: "a" },
      [
        [{ key: "count", op: "add", delta: 2 }, { key: "count", op: "add", delta: -2 }],
        [{ key: "label", op: "set", value: "b" }],
        [{ key: "count", op: "add", delta: 5 }, { key: "label", op: "set", value: "b" }],
      ],
    ],
    expected: { renders: 2, state: { count: 5, label: "b" } },
    hidden: true,
  },
  {
    name: "null to null is equal",
    args: [{ error: null }, [[{ key: "error", op: "set", value: null }], [{ key: "error", op: "set", value: "Oops" }]]],
    expected: { renders: 1, state: { error: "Oops" } },
    hidden: true,
  },
];
