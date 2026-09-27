import type { TestCase } from "@content/_authoring/types";

export const functionName = "matchRoute";

const routes = [
  { method: "GET", pattern: "/products" },
  { method: "POST", pattern: "/products" },
  { method: "GET", pattern: "/products/:id" },
  { method: "PUT", pattern: "/products/:id" },
  { method: "DELETE", pattern: "/products/:id" },
  { method: "GET", pattern: "/users/:userId/orders/:orderId" },
];

export const tests: TestCase[] = [
  { name: "matches a collection route", args: [routes, "GET", "/products"], expected: { status: 200, pattern: "/products", params: {} } },
  {
    name: "captures a route parameter",
    args: [routes, "GET", "/products/42"],
    expected: { status: 200, pattern: "/products/:id", params: { id: "42" } },
  },
  {
    name: "captures nested parameters",
    args: [routes, "GET", "/users/7/orders/1001"],
    expected: { status: 200, pattern: "/users/:userId/orders/:orderId", params: { userId: "7", orderId: "1001" } },
  },
  {
    name: "picks the route with the matching method",
    args: [routes, "DELETE", "/products/9"],
    expected: { status: 200, pattern: "/products/:id", params: { id: "9" } },
  },
  { name: "a known path with the wrong method is 405 with Allow", args: [routes, "PATCH", "/products/9"], expected: { status: 405, allow: ["GET", "PUT", "DELETE"] } },
  { name: "an unknown path is 404", args: [routes, "GET", "/categories"], expected: { status: 404 } },
  {
    name: "ignores a trailing slash",
    args: [routes, "post", "/products/"],
    expected: { status: 200, pattern: "/products", params: {} },
  },
  {
    name: "decodes parameters",
    args: [routes, "GET", "/products/desk%20lamp"],
    expected: { status: 200, pattern: "/products/:id", params: { id: "desk lamp" } },
    hidden: true,
  },
  { name: "an empty segment does not satisfy a parameter", args: [routes, "GET", "/users//orders/1"], expected: { status: 404 }, hidden: true },
  { name: "extra segments do not match", args: [routes, "GET", "/products/1/reviews"], expected: { status: 404 }, hidden: true },
];
