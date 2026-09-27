import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergePatch";

const product = { id: 7, name: "Desk Lamp", price: 30, tags: ["lighting", "desk"], dimensions: { w: 20, h: 45 } };

export const tests: TestCase[] = [
  {
    name: "changes only the fields in the patch",
    args: [product, { price: 25 }],
    expected: { id: 7, name: "Desk Lamp", price: 25, tags: ["lighting", "desk"], dimensions: { w: 20, h: 45 } },
  },
  {
    name: "null removes a field",
    args: [product, { tags: null }],
    expected: { id: 7, name: "Desk Lamp", price: 30, dimensions: { w: 20, h: 45 } },
  },
  {
    name: "nested objects merge",
    args: [product, { dimensions: { h: 50 } }],
    expected: { id: 7, name: "Desk Lamp", price: 30, tags: ["lighting", "desk"], dimensions: { w: 20, h: 50 } },
  },
  {
    name: "arrays are replaced, not merged",
    args: [product, { tags: ["sale"] }],
    expected: { id: 7, name: "Desk Lamp", price: 30, tags: ["sale"], dimensions: { w: 20, h: 45 } },
  },
  {
    name: "new fields are appended",
    args: [{ id: 1, name: "Mug" }, { color: "blue", name: "Big Mug" }],
    expected: { id: 1, name: "Big Mug", color: "blue" },
  },
  { name: "an empty patch changes nothing", args: [{ a: 1 }, {}], expected: { a: 1 } },
  { name: "a non-object patch replaces the target", args: [{ a: 1 }, ["x"]], expected: ["x"] },
  {
    name: "patching a missing nested object creates it (and drops nulls inside)",
    args: [{ id: 1 }, { address: { city: "Oslo", zip: null } }],
    expected: { id: 1, address: { city: "Oslo" } },
    hidden: true,
  },
  {
    name: "a scalar target is replaced by an object",
    args: [{ meta: "none" }, { meta: { a: 1 } }],
    expected: { meta: { a: 1 } },
    hidden: true,
  },
];
