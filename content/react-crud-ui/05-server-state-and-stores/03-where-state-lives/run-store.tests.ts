import type { TestCase } from "@content/_authoring/types";

export const functionName = "runStore";

const initial = { filter: "all", page: 1, sort: "name", sidebarOpen: false };

const subscribers = [
  { name: "FilterBar", keys: ["filter"] },
  { name: "Pager", keys: ["page", "sort"] },
  { name: "Sidebar", keys: ["sidebarOpen"] },
];

export const tests: TestCase[] = [
  {
    name: "only the subscriber whose slice changed re-renders",
    args: [initial, subscribers, [{ sidebarOpen: true }]],
    expected: {
      state: { filter: "all", page: 1, sort: "name", sidebarOpen: true },
      renders: { FilterBar: 0, Pager: 0, Sidebar: 1 },
    },
  },
  {
    name: "a multi-key selector re-renders when any selected key changes",
    args: [initial, subscribers, [{ page: 2 }, { sort: "price" }]],
    expected: {
      state: { filter: "all", page: 2, sort: "price", sidebarOpen: false },
      renders: { FilterBar: 0, Pager: 2, Sidebar: 0 },
    },
  },
  {
    name: "setting an equal primitive re-renders nobody with a selector",
    args: [initial, subscribers, [{ filter: "all" }]],
    expected: {
      state: { filter: "all", page: 1, sort: "name", sidebarOpen: false },
      renders: { FilterBar: 0, Pager: 0, Sidebar: 0 },
    },
  },
  {
    name: "a selector-less subscriber re-renders on every set",
    args: [initial, [{ name: "Everything", keys: [] }, { name: "FilterBar", keys: ["filter"] }], [{ filter: "all" }, { page: 3 }]],
    expected: {
      state: { filter: "all", page: 3, sort: "name", sidebarOpen: false },
      renders: { Everything: 2, FilterBar: 0 },
    },
  },
  {
    name: "one patch touching two slices",
    args: [initial, subscribers, [{ filter: "open", page: 1 }]],
    expected: {
      state: { filter: "open", page: 1, sort: "name", sidebarOpen: false },
      renders: { FilterBar: 1, Pager: 0, Sidebar: 0 },
    },
  },
  {
    name: "a fresh object with equal contents is still a change",
    args: [
      { user: { id: 1, name: "Ada" } },
      [{ name: "Avatar", keys: ["user"] }],
      [{ user: { id: 1, name: "Ada" } }],
    ],
    expected: { state: { user: { id: 1, name: "Ada" } }, renders: { Avatar: 1 } },
  },
  {
    name: "untouched object slices keep their reference",
    args: [
      { user: { id: 1, name: "Ada" }, theme: "light" },
      [{ name: "Avatar", keys: ["user"] }, { name: "Theme", keys: ["theme"] }],
      [{ theme: "dark" }, { theme: "light" }],
    ],
    expected: { state: { user: { id: 1, name: "Ada" }, theme: "light" }, renders: { Avatar: 0, Theme: 2 } },
    hidden: true,
  },
  {
    name: "no updates, no renders",
    args: [initial, subscribers, []],
    expected: { state: initial, renders: { FilterBar: 0, Pager: 0, Sidebar: 0 } },
    hidden: true,
  },
];
