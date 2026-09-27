import type { TestCase } from "@content/_authoring/types";

export const functionName = "matchRoute";

const routes = ["/", "/users", "/users/me", "/users/:id", "/users/:id/posts/:postId", "/files/*", "/:section/settings"];

export const tests: TestCase[] = [
  { name: "a param segment", args: [routes, "/users/42"], expected: { route: "/users/:id", params: { id: "42" } } },
  { name: "static beats param", args: [routes, "/users/me"], expected: { route: "/users/me", params: {} } },
  {
    name: "several params",
    args: [routes, "/users/7/posts/99"],
    expected: { route: "/users/:id/posts/:postId", params: { id: "7", postId: "99" } },
  },
  {
    name: "a wildcard captures the rest",
    args: [routes, "/files/a/b/c.txt"],
    expected: { route: "/files/*", params: { "*": "a/b/c.txt" } },
  },
  { name: "the root route", args: [routes, "/"], expected: { route: "/", params: {} } },
  { name: "a trailing slash is ignored", args: [routes, "/users/"], expected: { route: "/users", params: {} } },
  { name: "no match", args: [routes, "/nope/deeper/still"], expected: null },
  {
    name: "the first segment decides specificity",
    args: [routes, "/users/settings"],
    expected: { route: "/users/:id", params: { id: "settings" } },
  },
  {
    name: "falls back from a static branch that fails later",
    args: [["/users/me/edit", "/users/:id/delete"], "/users/me/delete"],
    expected: { route: "/users/:id/delete", params: { id: "me" } },
    hidden: true,
  },
  { name: "a wildcard needs at least one segment", args: [routes, "/files"], expected: null, hidden: true },
  {
    name: "params are URI-decoded",
    args: [routes, "/users/ann%20lee"],
    expected: { route: "/users/:id", params: { id: "ann lee" } },
    hidden: true,
  },
  {
    name: "a leading param",
    args: [routes, "/admin/settings"],
    expected: { route: "/:section/settings", params: { section: "admin" } },
    hidden: true,
  },
];
