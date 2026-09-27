import type { TestCase } from "@content/_authoring/types";

export const functionName = "buildMatrix";

const roles = ["admin", "editor", "viewer"];
const resources = ["posts", "users"];
const row = (role: string, posts: string, users: string) => ({ role, cells: { posts, users } });

export const tests: TestCase[] = [
  {
    name: "read-only viewer",
    args: [roles, resources, ["viewer:posts:read", "viewer:users:read"]],
    expected: [row("admin", "----", "----"), row("editor", "----", "----"), row("viewer", "-R--", "-R--")],
  },
  {
    name: "a double wildcard grants everything",
    args: [roles, resources, ["admin:*:*"]],
    expected: [row("admin", "CRUD", "CRUD"), row("editor", "----", "----"), row("viewer", "----", "----")],
  },
  {
    name: "letters keep CRUD order regardless of grant order",
    args: [roles, resources, ["editor:posts:update", "editor:posts:create", "editor:posts:read"]],
    expected: [row("admin", "----", "----"), row("editor", "CRU-", "----"), row("viewer", "----", "----")],
  },
  {
    name: "a resource wildcard with one action",
    args: [roles, resources, ["viewer:*:read"]],
    expected: [row("admin", "----", "----"), row("editor", "----", "----"), row("viewer", "-R--", "-R--")],
  },
  {
    name: "unknown roles and resources are ignored",
    args: [roles, resources, ["ghost:posts:read", "viewer:comments:read"]],
    expected: [row("admin", "----", "----"), row("editor", "----", "----"), row("viewer", "----", "----")],
  },
  {
    name: "duplicate grants are harmless",
    args: [["viewer"], resources, ["viewer:posts:read", "viewer:posts:read"]],
    expected: [row("viewer", "-R--", "----")],
  },
  {
    name: "an action wildcard on one resource",
    args: [["editor"], resources, ["editor:users:*"]],
    expected: [row("editor", "----", "CRUD")],
    hidden: true,
  },
  { name: "no roles means no rows", args: [[], resources, ["admin:*:*"]], expected: [], hidden: true },
];
