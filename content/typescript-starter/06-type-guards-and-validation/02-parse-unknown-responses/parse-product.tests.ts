import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseProduct";

export const tests: TestCase[] = [
  {
    name: "parses a complete body",
    args: [{ id: 7, title: "  Desk Lamp ", price: 19.99, tags: ["home", "light"] }],
    expected: { ok: true, product: { id: 7, title: "Desk Lamp", priceCents: 1999, tags: ["home", "light"] } },
  },
  {
    name: "missing tags default to an empty list",
    args: [{ id: 1, title: "Mug", price: 8 }],
    expected: { ok: true, product: { id: 1, title: "Mug", priceCents: 800, tags: [] } },
  },
  { name: "rejects a non-object body", args: ["<html>502</html>"], expected: { ok: false, error: "body is not an object" } },
  { name: "rejects null", args: [null], expected: { ok: false, error: "body is not an object" } },
  {
    name: "rejects an id sent as a string",
    args: [{ id: "7", title: "Mug", price: 8 }],
    expected: { ok: false, error: "id must be a positive integer" },
  },
  {
    name: "rejects a blank title",
    args: [{ id: 2, title: "   ", price: 1 }],
    expected: { ok: false, error: "title is required" },
  },
  {
    name: "reports only the first problem",
    args: [{ id: 3, price: -5, tags: "sale" }],
    expected: { ok: false, error: "title is required" },
  },
  {
    name: "rejects a negative price",
    args: [{ id: 4, title: "Pen", price: -1 }],
    expected: { ok: false, error: "price must be a non-negative number" },
    hidden: true,
  },
  {
    name: "rejects tags that are not all strings",
    args: [{ id: 5, title: "Pen", price: 0, tags: ["ok", 3] }],
    expected: { ok: false, error: "tags must be an array of strings" },
    hidden: true,
  },
  {
    name: "rejects an array body",
    args: [[{ id: 1, title: "Mug", price: 8 }]],
    expected: { ok: false, error: "body is not an object" },
    hidden: true,
  },
];
