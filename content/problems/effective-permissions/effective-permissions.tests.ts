import type { TestCase } from "@content/_authoring/types";

export const functionName = "checkPermissions";

const role = (name: string, inherits: string[], allow: string[], deny: string[] = []) => ({
  name,
  inherits,
  allow,
  deny,
});

const roles = [
  role("viewer", [], ["orders:read", "products:read"]),
  role("editor", ["viewer"], ["orders:write", "products:*"]),
  role("support", ["viewer"], ["refunds:create"], ["products:delete"]),
  role("admin", [], ["*"]),
];

export const tests: TestCase[] = [
  {
    name: "grants a role's own permissions",
    args: [roles, ["viewer"], ["orders:read", "orders:write"]],
    expected: [true, false],
  },
  {
    name: "includes inherited permissions and wildcards",
    args: [roles, ["editor"], ["orders:read", "orders:write", "products:delete"]],
    expected: [true, true, true],
  },
  {
    name: "a deny from any role wins",
    args: [roles, ["editor", "support"], ["products:delete", "refunds:create"]],
    expected: [false, true],
  },
  { name: "* matches everything", args: [roles, ["admin"], ["anything:goes"]], expected: [true] },
  { name: "unknown roles grant nothing", args: [roles, ["ghost"], ["orders:read"]], expected: [false] },
  { name: "no checks", args: [roles, ["admin"], []], expected: [] },
  {
    name: "inheritance cycles do not hang",
    args: [[role("a", ["b"], ["x:read"]), role("b", ["a"], ["y:read"])], ["a"], ["x:read", "y:read", "z:read"]],
    expected: [true, true, false],
    hidden: true,
  },
  {
    name: "a prefix wildcard needs the colon boundary",
    args: [[role("r", [], ["orders:*"])], ["r"], ["orders:read", "orders", "ordersArchive:read"]],
    expected: [true, false, false],
    hidden: true,
  },
  {
    name: "a wildcard deny carves out of a global allow",
    args: [[role("ops", [], ["*"], ["billing:*"])], ["ops"], ["billing:view", "users:view"]],
    expected: [false, true],
    hidden: true,
  },
];
