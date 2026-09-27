import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseEventName";

export const tests: TestCase[] = [
  {
    name: "parses a known event",
    args: ["order.created"],
    expected: { name: "order.created", entity: "order", action: "created", label: "Order created" },
  },
  {
    name: "trims surrounding whitespace",
    args: ["  invoice.deleted\n"],
    expected: { name: "invoice.deleted", entity: "invoice", action: "deleted", label: "Invoice deleted" },
  },
  { name: "unknown entity", args: ["payment.created"], expected: null },
  { name: "unknown action", args: ["user.archived"], expected: null },
  { name: "missing dot", args: ["usercreated"], expected: null },
  { name: "is case-sensitive", args: ["User.Created"], expected: null },
  { name: "too many parts", args: ["user.created.v2"], expected: null, hidden: true },
  { name: "empty string", args: [""], expected: null, hidden: true },
  {
    name: "user updated",
    args: ["user.updated"],
    expected: { name: "user.updated", entity: "user", action: "updated", label: "User updated" },
    hidden: true,
  },
];
