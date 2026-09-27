import type { TestCase } from "@content/_authoring/types";

export const functionName = "simulateKeyedState";

const prev = [
  { id: 1, label: "Apples", draft: "buy green" },
  { id: 2, label: "Bread", draft: "" },
  { id: 3, label: "Milk", draft: "oat" },
];

const withEggsFirst = [
  { id: 9, label: "Eggs" },
  { id: 1, label: "Apples" },
  { id: 2, label: "Bread" },
  { id: 3, label: "Milk" },
];

export const tests: TestCase[] = [
  {
    name: "id keys: deleting the first row keeps the other drafts",
    args: [prev, [{ id: 2, label: "Bread" }, { id: 3, label: "Milk" }], "id"],
    expected: {
      rows: [
        { key: "2", label: "Bread", draft: "" },
        { key: "3", label: "Milk", draft: "oat" },
      ],
      unmountedKeys: ["1"],
    },
  },
  {
    name: "index keys: deleting the first row shifts drafts onto the wrong items",
    args: [prev, [{ id: 2, label: "Bread" }, { id: 3, label: "Milk" }], "index"],
    expected: {
      rows: [
        { key: "0", label: "Bread", draft: "buy green" },
        { key: "1", label: "Milk", draft: "" },
      ],
      unmountedKeys: ["2"],
    },
  },
  {
    name: "id keys: prepending mounts only the new row",
    args: [prev, withEggsFirst, "id"],
    expected: {
      rows: [
        { key: "9", label: "Eggs", draft: "" },
        { key: "1", label: "Apples", draft: "buy green" },
        { key: "2", label: "Bread", draft: "" },
        { key: "3", label: "Milk", draft: "oat" },
      ],
      unmountedKeys: [],
    },
  },
  {
    name: "index keys: prepending gives the new row an old draft",
    args: [prev, withEggsFirst, "index"],
    expected: {
      rows: [
        { key: "0", label: "Eggs", draft: "buy green" },
        { key: "1", label: "Apples", draft: "" },
        { key: "2", label: "Bread", draft: "oat" },
        { key: "3", label: "Milk", draft: "" },
      ],
      unmountedKeys: [],
    },
  },
  {
    name: "id keys: reordering moves drafts with their items",
    args: [prev, [{ id: 3, label: "Milk" }, { id: 1, label: "Apples" }, { id: 2, label: "Bread" }], "id"],
    expected: {
      rows: [
        { key: "3", label: "Milk", draft: "oat" },
        { key: "1", label: "Apples", draft: "buy green" },
        { key: "2", label: "Bread", draft: "" },
      ],
      unmountedKeys: [],
    },
  },
  {
    name: "props still update: a renamed item keeps its draft",
    args: [prev, [{ id: 1, label: "Red apples" }, { id: 2, label: "Bread" }, { id: 3, label: "Milk" }], "id"],
    expected: {
      rows: [
        { key: "1", label: "Red apples", draft: "buy green" },
        { key: "2", label: "Bread", draft: "" },
        { key: "3", label: "Milk", draft: "oat" },
      ],
      unmountedKeys: [],
    },
  },
  {
    name: "clearing the list unmounts every row",
    args: [prev, [], "id"],
    expected: { rows: [], unmountedKeys: ["1", "2", "3"] },
    hidden: true,
  },
  {
    name: "index keys: removing the last row looks fine",
    args: [prev, [{ id: 1, label: "Apples" }, { id: 2, label: "Bread" }], "index"],
    expected: {
      rows: [
        { key: "0", label: "Apples", draft: "buy green" },
        { key: "1", label: "Bread", draft: "" },
      ],
      unmountedKeys: ["2"],
    },
    hidden: true,
  },
];
