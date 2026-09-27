import type { TestCase } from "@content/_authoring/types";

export const functionName = "runFormEvents";

const initial = { name: "Desk", price: "120", sku: "" };

export const tests: TestCase[] = [
  {
    name: "no events: pristine",
    args: [initial, []],
    expected: { values: { name: "Desk", price: "120", sku: "" }, touched: [], dirty: [], isDirty: false },
  },
  {
    name: "typing makes a field dirty",
    args: [initial, [{ type: "change", field: "price", value: "99" }]],
    expected: { values: { name: "Desk", price: "99", sku: "" }, touched: [], dirty: ["price"], isDirty: true },
  },
  {
    name: "typing back to the original value is not dirty",
    args: [
      initial,
      [
        { type: "change", field: "name", value: "Desk!" },
        { type: "change", field: "name", value: "Desk" },
      ],
    ],
    expected: { values: { name: "Desk", price: "120", sku: "" }, touched: [], dirty: [], isDirty: false },
  },
  {
    name: "blur marks touched once, in first-blur order",
    args: [
      initial,
      [
        { type: "blur", field: "sku" },
        { type: "blur", field: "name" },
        { type: "blur", field: "sku" },
      ],
    ],
    expected: { values: { name: "Desk", price: "120", sku: "" }, touched: ["sku", "name"], dirty: [], isDirty: false },
  },
  {
    name: "dirty follows initial key order",
    args: [
      initial,
      [
        { type: "change", field: "sku", value: "DSK-0001" },
        { type: "change", field: "name", value: "Standing desk" },
      ],
    ],
    expected: {
      values: { name: "Standing desk", price: "120", sku: "DSK-0001" },
      touched: [],
      dirty: ["name", "sku"],
      isDirty: true,
    },
  },
  {
    name: "reset restores values and clears touched",
    args: [
      initial,
      [
        { type: "change", field: "price", value: "1" },
        { type: "blur", field: "price" },
        { type: "reset" },
      ],
    ],
    expected: { values: { name: "Desk", price: "120", sku: "" }, touched: [], dirty: [], isDirty: false },
  },
  {
    name: "unknown fields are ignored",
    args: [
      initial,
      [
        { type: "change", field: "colour", value: "red" },
        { type: "blur", field: "colour" },
      ],
    ],
    expected: { values: { name: "Desk", price: "120", sku: "" }, touched: [], dirty: [], isDirty: false },
    hidden: true,
  },
  {
    name: "events after a reset still count",
    args: [
      initial,
      [
        { type: "blur", field: "name" },
        { type: "reset" },
        { type: "change", field: "sku", value: "X" },
        { type: "blur", field: "sku" },
      ],
    ],
    expected: { values: { name: "Desk", price: "120", sku: "X" }, touched: ["sku"], dirty: ["sku"], isDirty: true },
    hidden: true,
  },
];
