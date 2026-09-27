import type { TestCase } from "@content/_authoring/types";

export const functionName = "mergeDuplicateContacts";

export const tests: TestCase[] = [
  {
    name: "matches emails regardless of case and spaces",
    args: [
      [
        { id: "1", email: " Ada@Example.com ", phone: null },
        { id: "2", email: "ada@example.com", phone: null },
        { id: "3", email: "bob@example.com", phone: null },
      ],
    ],
    expected: [["1", "2"], ["3"]],
  },
  {
    name: "gmail ignores dots, plus tags and the googlemail domain",
    args: [
      [
        { id: "a", email: "a.d.a+news@gmail.com", phone: null },
        { id: "b", email: "ada@googlemail.com", phone: null },
      ],
    ],
    expected: [["a", "b"]],
  },
  {
    name: "other domains drop plus tags but keep dots",
    args: [
      [
        { id: "a", email: "sam+crm@acme.io", phone: null },
        { id: "b", email: "sam@acme.io", phone: null },
        { id: "c", email: "s.am@acme.io", phone: null },
      ],
    ],
    expected: [["a", "b"], ["c"]],
  },
  {
    name: "normalizes phone formatting and country code",
    args: [
      [
        { id: "a", email: null, phone: "(555) 123-4567" },
        { id: "b", email: null, phone: "+1 555 123 4567" },
      ],
    ],
    expected: [["a", "b"]],
  },
  {
    name: "joins contacts transitively",
    args: [
      [
        { id: "A", email: "x@shop.com", phone: null },
        { id: "D", email: "d@shop.com", phone: null },
        { id: "B", email: "X@shop.com", phone: "555-000-1111" },
        { id: "C", email: null, phone: "5550001111" },
      ],
    ],
    expected: [["A", "B", "C"], ["D"]],
  },
  {
    name: "blank values never match each other",
    args: [
      [
        { id: "1", email: null, phone: "" },
        { id: "2", email: "", phone: null },
      ],
    ],
    expected: [["1"], ["2"]],
  },
  {
    name: "short phone numbers are ignored",
    args: [
      [
        { id: "1", email: null, phone: "123" },
        { id: "2", email: null, phone: "123" },
      ],
    ],
    expected: [["1"], ["2"]],
    hidden: true,
  },
  {
    name: "a later contact can join two existing groups",
    args: [
      [
        { id: "1", email: "e1@x.com", phone: null },
        { id: "2", email: null, phone: "2025550100" },
        { id: "3", email: "z@x.com", phone: null },
        { id: "4", email: "E1@x.com", phone: "202-555-0100" },
      ],
    ],
    expected: [["1", "2", "4"], ["3"]],
    hidden: true,
  },
  { name: "no contacts", args: [[]], expected: [], hidden: true },
];
