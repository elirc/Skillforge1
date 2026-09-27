import type { TestCase } from "@content/_authoring/types";

export const functionName = "planMigrations";

export const tests: TestCase[] = [
  {
    name: "orders a simple chain regardless of input order",
    args: [
      [
        { id: "003_add_index", dependsOn: ["002_add_email"] },
        { id: "001_create_users", dependsOn: [] },
        { id: "002_add_email", dependsOn: ["001_create_users"] },
      ],
    ],
    expected: { ok: true, order: ["001_create_users", "002_add_email", "003_add_index"] },
  },
  {
    name: "breaks ties alphabetically among ready migrations",
    args: [
      [
        { id: "create_users", dependsOn: [] },
        { id: "create_products", dependsOn: [] },
        { id: "create_orders", dependsOn: ["create_users", "create_products"] },
        { id: "seed_admin", dependsOn: ["create_users"] },
      ],
    ],
    expected: { ok: true, order: ["create_products", "create_users", "create_orders", "seed_admin"] },
  },
  {
    name: "ignores dependencies that were already applied",
    args: [
      [
        { id: "b", dependsOn: ["already_applied"] },
        { id: "a", dependsOn: [] },
      ],
    ],
    expected: { ok: true, order: ["a", "b"] },
  },
  {
    name: "reports a three-way cycle as blocked",
    args: [
      [
        { id: "a", dependsOn: ["c"] },
        { id: "b", dependsOn: ["a"] },
        { id: "c", dependsOn: ["b"] },
        { id: "d", dependsOn: [] },
      ],
    ],
    expected: { ok: false, blocked: ["a", "b", "c"] },
  },
  {
    name: "blocks migrations that depend on a cycle",
    args: [
      [
        { id: "x", dependsOn: ["y"] },
        { id: "y", dependsOn: ["x"] },
        { id: "z", dependsOn: ["x"] },
        { id: "w", dependsOn: [] },
      ],
    ],
    expected: { ok: false, blocked: ["x", "y", "z"] },
  },
  { name: "an empty folder is a valid empty plan", args: [[]], expected: { ok: true, order: [] } },
  {
    name: "counts a dependency listed twice only once",
    args: [
      [
        { id: "a", dependsOn: [] },
        { id: "b", dependsOn: ["a", "a"] },
      ],
    ],
    expected: { ok: true, order: ["a", "b"] },
    hidden: true,
  },
  {
    name: "a migration that depends on itself is blocked",
    args: [
      [
        { id: "a", dependsOn: ["a"] },
        { id: "b", dependsOn: [] },
      ],
    ],
    expected: { ok: false, blocked: ["a"] },
    hidden: true,
  },
  {
    name: "a newly ready migration can jump ahead alphabetically",
    args: [
      [
        { id: "q", dependsOn: [] },
        { id: "p", dependsOn: ["q"] },
        { id: "a", dependsOn: ["q"] },
      ],
    ],
    expected: { ok: true, order: ["q", "a", "p"] },
    hidden: true,
  },
];
