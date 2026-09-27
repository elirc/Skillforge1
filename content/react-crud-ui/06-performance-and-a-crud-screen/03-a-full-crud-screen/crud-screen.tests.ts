import type { TestCase } from "@content/_authoring/types";

export const functionName = "crudScreen";

const items = [
  { id: 1, title: "Desk" },
  { id: 2, title: "Chair" },
];

export const tests: TestCase[] = [
  {
    name: "selecting shows the detail view",
    args: [items, [{ type: "select", id: 2 }]],
    expected: { mode: "detail", selectedId: 2, draft: null, notice: null, items },
  },
  {
    name: "edit and save renames the item",
    args: [
      items,
      [{ type: "select", id: 1 }, { type: "edit" }, { type: "change", title: "  Standing desk " }, { type: "save" }],
    ],
    expected: {
      mode: "detail",
      selectedId: 1,
      draft: null,
      notice: "Saved",
      items: [
        { id: 1, title: "Standing desk" },
        { id: 2, title: "Chair" },
      ],
    },
  },
  {
    name: "an empty title keeps the form open with a message",
    args: [items, [{ type: "select", id: 1 }, { type: "edit" }, { type: "change", title: "   " }, { type: "save" }]],
    expected: { mode: "edit", selectedId: 1, draft: { title: "   " }, notice: "Title is required", items },
  },
  {
    name: "delete asks for confirmation first",
    args: [items, [{ type: "select", id: 2 }, { type: "delete" }]],
    expected: { mode: "confirm-delete", selectedId: 2, draft: null, notice: null, items },
  },
  {
    name: "confirming deletes and returns to the list",
    args: [items, [{ type: "select", id: 2 }, { type: "delete" }, { type: "confirm" }]],
    expected: { mode: "list", selectedId: null, draft: null, notice: "Deleted", items: [{ id: 1, title: "Desk" }] },
  },
  {
    name: "cancelling the confirmation keeps the item",
    args: [items, [{ type: "select", id: 2 }, { type: "delete" }, { type: "cancel" }]],
    expected: { mode: "detail", selectedId: 2, draft: null, notice: null, items },
  },
  {
    name: "creating adds an item with the next id",
    args: [items, [{ type: "new" }, { type: "change", title: "Lamp" }, { type: "save" }]],
    expected: {
      mode: "detail",
      selectedId: 3,
      draft: null,
      notice: "Created",
      items: [
        { id: 1, title: "Desk" },
        { id: 2, title: "Chair" },
        { id: 3, title: "Lamp" },
      ],
    },
  },
  {
    name: "events that do not fit the mode are ignored",
    args: [
      items,
      [
        { type: "edit" },
        { type: "confirm" },
        { type: "select", id: 1 },
        { type: "edit" },
        { type: "select", id: 2 },
        { type: "back" },
      ],
    ],
    expected: { mode: "edit", selectedId: 1, draft: { title: "Desk" }, notice: null, items },
    hidden: true,
  },
  {
    name: "cancelling a create returns to the list; selecting a missing id does nothing",
    args: [[], [{ type: "new" }, { type: "change", title: "X" }, { type: "cancel" }, { type: "select", id: 1 }]],
    expected: { mode: "list", selectedId: null, draft: null, notice: null, items: [] },
    hidden: true,
  },
  {
    name: "the first item in an empty list gets id 1",
    args: [[], [{ type: "new" }, { type: "change", title: "First" }, { type: "save" }, { type: "back" }]],
    expected: { mode: "list", selectedId: null, draft: null, notice: null, items: [{ id: 1, title: "First" }] },
    hidden: true,
  },
];
