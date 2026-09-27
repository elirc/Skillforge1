import type { TestCase } from "@content/_authoring/types";

export const functionName = "List";

const p = (Id: string, Name: string, Category: string, Price: number, day: number) => ({
  Id,
  Name,
  Category,
  Price,
  CreatedAt: `2026-06-${String(day).padStart(2, "0")}T00:00:00Z`,
});

const products = [
  p("p1", "Enamel Mug", "Kitchen", 12, 3),
  p("p2", "black tee", "Apparel", 20, 1),
  p("p3", "Mug Warmer", "Kitchen", 25, 5),
  p("p4", "Canvas Tote", "Apparel", 12, 2),
  p("p5", "Travel Mug", "kitchen", 18, 4),
];

const q = (overrides: Record<string, unknown> = {}) => ({
  Search: null,
  Category: null,
  Sort: null,
  Page: null,
  PageSize: null,
  ...overrides,
});

export const tests: TestCase[] = [
  {
    name: "defaults: name ascending, page 1 of size 20",
    args: [products, q()],
    expected: { Ids: ["p2", "p4", "p1", "p3", "p5"], Page: 1, PageSize: 20, TotalCount: 5, TotalPages: 1 },
  },
  {
    name: "search and category filters ignore case",
    args: [products, q({ Search: "MUG", Category: "kitchen" })],
    expected: { Ids: ["p1", "p3", "p5"], Page: 1, PageSize: 20, TotalCount: 3, TotalPages: 1 },
  },
  {
    name: "sorts by price with Id as the tie-breaker",
    args: [products, q({ Sort: "price" })],
    expected: { Ids: ["p1", "p4", "p5", "p2", "p3"], Page: 1, PageSize: 20, TotalCount: 5, TotalPages: 1 },
  },
  {
    name: "descending by creation date, second page of two",
    args: [products, q({ Sort: "-created", Page: 2, PageSize: 2 })],
    expected: { Ids: ["p1", "p4"], Page: 2, PageSize: 2, TotalCount: 5, TotalPages: 3 },
  },
  {
    name: "an unknown sort field falls back to name, not an arbitrary column",
    args: [products, q({ Sort: "Password", PageSize: 2 })],
    expected: { Ids: ["p2", "p4"], Page: 1, PageSize: 2, TotalCount: 5, TotalPages: 3 },
  },
  {
    name: "clamps page size and page number",
    args: [products, q({ Page: -4, PageSize: 1000, Sort: "-NAME" })],
    expected: { Ids: ["p5", "p3", "p1", "p4", "p2"], Page: 1, PageSize: 100, TotalCount: 5, TotalPages: 1 },
    hidden: true,
  },
  {
    name: "a page past the end is empty but still reports totals",
    args: [products, q({ Page: 9, PageSize: 2 })],
    expected: { Ids: [], Page: 9, PageSize: 2, TotalCount: 5, TotalPages: 3 },
    hidden: true,
  },
  {
    name: "no matches means zero pages",
    args: [products, q({ Search: "  lamp  ", PageSize: 0 })],
    expected: { Ids: [], Page: 1, PageSize: 1, TotalCount: 0, TotalPages: 0 },
    hidden: true,
  },
];
