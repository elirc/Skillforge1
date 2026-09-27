import type { TestCase } from "@content/_authoring/types";

export const functionName = "toProblemDetails";

export const tests: TestCase[] = [
  {
    name: "not-found becomes 404 with a detail",
    args: [{ kind: "not-found", resource: "Product", id: "42" }, "/products/42"],
    expected: {
      type: "https://example.com/problems/not-found",
      title: "Resource not found",
      status: 404,
      detail: "Product 42 was not found.",
      instance: "/products/42",
    },
  },
  {
    name: "validation becomes 400 with field errors",
    args: [{ kind: "validation", errors: { name: ["Name is required."] } }, "/products"],
    expected: {
      type: "https://example.com/problems/validation",
      title: "One or more validation errors occurred.",
      status: 400,
      instance: "/products",
      errors: { name: ["Name is required."] },
    },
  },
  {
    name: "conflict becomes 409 and keeps its detail",
    args: [{ kind: "conflict", detail: "Email is already registered." }, "/users"],
    expected: {
      type: "https://example.com/problems/conflict",
      title: "Conflict",
      status: 409,
      detail: "Email is already registered.",
      instance: "/users",
    },
  },
  {
    name: "unexpected errors hide their message",
    args: [{ kind: "unexpected", message: "Login failed for user 'sa'", stack: "at Db.Open()" }, "/orders"],
    expected: { type: "about:blank", title: "An unexpected error occurred.", status: 500, instance: "/orders" },
  },
  {
    name: "validation errors can list several messages per field",
    args: [{ kind: "validation", errors: { price: ["Must be positive.", "Must have 2 decimals at most."], sku: ["Required."] } }, "/products/3"],
    expected: {
      type: "https://example.com/problems/validation",
      title: "One or more validation errors occurred.",
      status: 400,
      instance: "/products/3",
      errors: { price: ["Must be positive.", "Must have 2 decimals at most."], sku: ["Required."] },
    },
  },
  {
    name: "not-found works for nested resources",
    args: [{ kind: "not-found", resource: "Order", id: "1001" }, "/users/7/orders/1001"],
    expected: {
      type: "https://example.com/problems/not-found",
      title: "Resource not found",
      status: 404,
      detail: "Order 1001 was not found.",
      instance: "/users/7/orders/1001",
    },
    hidden: true,
  },
  {
    name: "an unexpected error never leaks its stack",
    args: [{ kind: "unexpected", message: "", stack: "secret" }, "/"],
    expected: { type: "about:blank", title: "An unexpected error occurred.", status: 500, instance: "/" },
    hidden: true,
  },
];
