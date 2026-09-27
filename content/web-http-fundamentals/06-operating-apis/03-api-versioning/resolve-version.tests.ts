import type { TestCase } from "@content/_authoring/types";

export const functionName = "resolveVersion";

const policy = { supported: ["1", "2", "3"], deprecated: ["1"], defaultVersion: "2" };

export const tests: TestCase[] = [
  {
    name: "reads the version from the path and strips it",
    args: [{ path: "/v3/products/7", headers: {}, query: {} }, policy],
    expected: { status: 200, version: "3", deprecated: false, path: "/products/7" },
  },
  {
    name: "reads the api-version header",
    args: [{ path: "/products", headers: { "api-version": "3" }, query: {} }, policy],
    expected: { status: 200, version: "3", deprecated: false, path: "/products" },
  },
  {
    name: "reads the api-version query parameter",
    args: [{ path: "/products", headers: {}, query: { "api-version": " 1 " } }, policy],
    expected: { status: 200, version: "1", deprecated: true, path: "/products" },
  },
  {
    name: "falls back to the default version",
    args: [{ path: "/products", headers: {}, query: {} }, policy],
    expected: { status: 200, version: "2", deprecated: false, path: "/products" },
  },
  {
    name: "rejects an unsupported version",
    args: [{ path: "/v9/products", headers: {}, query: {} }, policy],
    expected: { status: 400, error: "Unsupported API version '9'. Supported: 1, 2, 3" },
  },
  {
    name: "rejects conflicting versions",
    args: [{ path: "/v2/products", headers: { "api-version": "3" }, query: {} }, policy],
    expected: { status: 400, error: "Conflicting API versions" },
  },
  {
    name: "the same version in two places is fine",
    args: [{ path: "/v1/orders", headers: { "api-version": "1" }, query: {} }, policy],
    expected: { status: 200, version: "1", deprecated: true, path: "/orders" },
  },
  {
    name: "a bare version prefix becomes /",
    args: [{ path: "/v3", headers: { "api-version": "" }, query: {} }, policy],
    expected: { status: 200, version: "3", deprecated: false, path: "/" },
    hidden: true,
  },
  {
    name: "a path that merely starts with v is not a version",
    args: [{ path: "/videos/5", headers: {}, query: {} }, policy],
    expected: { status: 200, version: "2", deprecated: false, path: "/videos/5" },
    hidden: true,
  },
];
