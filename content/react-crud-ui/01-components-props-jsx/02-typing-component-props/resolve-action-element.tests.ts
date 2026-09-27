import type { TestCase } from "@content/_authoring/types";

export const functionName = "resolveActionElement";

export const tests: TestCase[] = [
  {
    name: "a button defaults to type button, enabled, primary",
    args: [{ as: "button", label: "Save" }],
    expected: { tag: "button", className: "btn btn-primary", text: "Save", attrs: { type: "button", disabled: false } },
  },
  {
    name: "a submit button keeps its explicit type",
    args: [{ as: "button", label: "Create", type: "submit" }],
    expected: { tag: "button", className: "btn btn-primary", text: "Create", attrs: { type: "submit", disabled: false } },
  },
  {
    name: "a disabled danger button",
    args: [{ as: "button", label: "Delete", variant: "danger", disabled: true }],
    expected: { tag: "button", className: "btn btn-danger", text: "Delete", attrs: { type: "button", disabled: true } },
  },
  {
    name: "an internal link has only href",
    args: [{ as: "link", label: "Products", href: "/products" }],
    expected: { tag: "a", className: "btn btn-primary", text: "Products", attrs: { href: "/products" } },
  },
  {
    name: "an external link opens safely in a new tab",
    args: [{ as: "link", label: "Docs", href: "https://react.dev", external: true, variant: "ghost" }],
    expected: {
      tag: "a",
      className: "btn btn-ghost",
      text: "Docs",
      attrs: { href: "https://react.dev", target: "_blank", rel: "noopener noreferrer" },
    },
  },
  {
    name: "labels are trimmed",
    args: [{ as: "button", label: "  Edit  " }],
    expected: { tag: "button", className: "btn btn-primary", text: "Edit", attrs: { type: "button", disabled: false } },
  },
  {
    name: "external: false behaves like an internal link",
    args: [{ as: "link", label: "Home", href: "/", external: false }],
    expected: { tag: "a", className: "btn btn-primary", text: "Home", attrs: { href: "/" } },
    hidden: true,
  },
  {
    name: "a reset button",
    args: [{ as: "button", label: "Clear", type: "reset", variant: "ghost" }],
    expected: { tag: "button", className: "btn btn-ghost", text: "Clear", attrs: { type: "reset", disabled: false } },
    hidden: true,
  },
];
