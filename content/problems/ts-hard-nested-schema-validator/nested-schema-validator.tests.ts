import type { TestCase } from "@content/_authoring/types";

export const functionName = "validate";

const userSchema = {
  type: "object",
  required: ["name", "email", "roles"],
  properties: {
    name: { type: "string", minLength: 2 },
    email: { type: "string" },
    age: { type: "number", integer: true, min: 13 },
    roles: { type: "array", minItems: 1, items: { type: "string", enum: ["viewer", "editor", "admin"] } },
  },
};

const orderSchema = {
  type: "object",
  required: ["id", "lines"],
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    lines: {
      type: "array",
      items: {
        type: "object",
        required: ["sku", "qty"],
        properties: {
          sku: { type: "string", minLength: 3 },
          qty: { type: "number", integer: true, min: 1, max: 99 },
          gift: { type: "boolean" },
        },
      },
    },
  },
};

export const tests: TestCase[] = [
  {
    name: "a valid object has no errors",
    args: [userSchema, { name: "Ada", email: "ada@x.io", roles: ["admin"] }],
    expected: {},
  },
  {
    name: "missing required fields are reported at their own paths",
    args: [userSchema, { name: "Ada" }],
    expected: { "$.email": "is required", "$.roles": "is required" },
  },
  {
    name: "optional fields are only checked when present",
    args: [userSchema, { name: "Ada", email: "a@x.io", roles: ["viewer"], age: 12 }],
    expected: { "$.age": "must be >= 13" },
  },
  {
    name: "array items use bracket paths",
    args: [userSchema, { name: "Ada", email: "a@x.io", roles: ["viewer", "owner"] }],
    expected: { "$.roles[1]": "must be one of: viewer, editor, admin" },
  },
  {
    name: "wrong types stop at the first failing rule",
    args: [userSchema, { name: 7, email: "a@x.io", roles: "admin", age: 20.5 }],
    expected: { "$.name": "expected string", "$.age": "expected integer", "$.roles": "expected array" },
  },
  {
    name: "a non-object root",
    args: [userSchema, null],
    expected: { $: "expected object" },
  },
  {
    name: "nested objects inside arrays",
    args: [
      orderSchema,
      {
        id: "o1",
        lines: [
          { sku: "ABC", qty: 2 },
          { sku: "X", qty: 0 },
          { qty: 1, gift: "yes" },
        ],
      },
    ],
    expected: {
      "$.lines[1].sku": "must be at least 3 characters",
      "$.lines[1].qty": "must be >= 1",
      "$.lines[2].sku": "is required",
      "$.lines[2].gift": "expected boolean",
    },
  },
  {
    name: "additionalProperties false rejects unknown keys",
    args: [orderSchema, { id: "o1", lines: [], coupon: "FREE" }],
    expected: { "$.coupon": "is not allowed" },
    hidden: true,
  },
  {
    name: "minItems is reported and items are still checked",
    args: [
      { type: "array", minItems: 3, items: { type: "number", max: 10 } },
      [4, 11],
    ],
    expected: { $: "must have at least 3 items", "$[1]": "must be <= 10" },
    hidden: true,
  },
  {
    name: "null is present but has the wrong type",
    args: [userSchema, { name: "Ada", email: null, roles: [] }],
    expected: { "$.email": "expected string", "$.roles": "must have at least 1 items" },
    hidden: true,
  },
];
