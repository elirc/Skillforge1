import type { TestCase } from "@content/_authoring/types";

export const functionName = "renderToText";

export const tests: TestCase[] = [
  { name: "a plain string renders as-is", args: ["Hello"], expected: "Hello" },
  {
    name: "an element renders its children in order",
    args: [{ type: "h1", props: { children: ["Hello, ", "Ada", "!"] } }],
    expected: "Hello, Ada!",
  },
  {
    name: "false from a failed && renders nothing",
    args: [{ type: "div", props: { children: ["Inbox", false] } }],
    expected: "Inbox",
  },
  {
    name: "0 from {count && <Badge />} renders as text",
    args: [{ type: "div", props: { children: ["Inbox", 0] } }],
    expected: "Inbox0",
  },
  {
    name: "nested elements and numbers",
    args: [{ type: "p", props: { children: [{ type: "strong", props: { children: 3 } }, " items"] } }],
    expected: "3 items",
  },
  { name: "null renders nothing", args: [null], expected: "" },
  {
    name: "a mapped list renders each item",
    args: [
      {
        type: "ul",
        props: { children: [[{ type: "li", props: { children: "a" } }, { type: "li", props: { children: "b" } }]] },
      },
    ],
    expected: "ab",
  },
  {
    name: "HTML-looking strings stay text",
    args: [{ type: "p", props: { children: "<b>bold</b>" } }],
    expected: "<b>bold</b>",
    hidden: true,
  },
  {
    name: "a fragment and an element without children",
    args: [{ type: "Fragment", props: { children: [{ type: "hr" }, "end", true] } }],
    expected: "end",
    hidden: true,
  },
];
