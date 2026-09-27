import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergeInterfaces";

export const tests: TestCase[] = [
  {
    name: "two declarations of User merge their members",
    args: [[{ name: "User", members: { id: "string" } }, { name: "User", members: { email: "string" } }]],
    expected: { interfaces: { User: { id: "string", email: "string" } }, errors: [] },
  },
  {
    name: "different names stay separate",
    args: [[{ name: "A", members: { x: "number" } }, { name: "B", members: { y: "number" } }]],
    expected: { interfaces: { A: { x: "number" }, B: { y: "number" } }, errors: [] },
  },
  {
    name: "repeating a property with the same type is fine",
    args: [[{ name: "Box", members: { size: "number" } }, { name: "Box", members: { size: "number", label: "string" } }]],
    expected: { interfaces: { Box: { size: "number", label: "string" } }, errors: [] },
  },
  {
    name: "a conflicting type is an error and the first type is kept",
    args: [[{ name: "Box", members: { size: "number" } }, { name: "Box", members: { size: "string" } }]],
    expected: {
      interfaces: { Box: { size: "number" } },
      errors: ["Box.size: subsequent declaration has type 'string', expected 'number'"],
    },
  },
  {
    name: "an augmentation adds to a library interface",
    args: [[
      { name: "Request", members: { url: "string", method: "string" } },
      { name: "Window", members: { title: "string" } },
      { name: "Request", members: { user: "User | undefined" } },
    ]],
    expected: {
      interfaces: {
        Request: { url: "string", method: "string", user: "User | undefined" },
        Window: { title: "string" },
      },
      errors: [],
    },
  },
  { name: "no declarations", args: [[]], expected: { interfaces: {}, errors: [] } },
  {
    name: "every conflict is reported, in order",
    args: [[
      { name: "T", members: { a: "string", b: "number" } },
      { name: "T", members: { a: "number" } },
      { name: "T", members: { b: "boolean", c: "string" } },
    ]],
    expected: {
      interfaces: { T: { a: "string", b: "number", c: "string" } },
      errors: [
        "T.a: subsequent declaration has type 'number', expected 'string'",
        "T.b: subsequent declaration has type 'boolean', expected 'number'",
      ],
    },
    hidden: true,
  },
];
