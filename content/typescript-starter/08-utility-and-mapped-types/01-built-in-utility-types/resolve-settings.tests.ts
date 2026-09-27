import type { TestCase } from "@content/_authoring/types";

export const functionName = "resolveSettings";

export const tests: TestCase[] = [
  {
    name: "an empty object gets every default",
    args: [{}],
    expected: { theme: "system", pageSize: 20, emailDigest: "weekly", locale: "en-US" },
  },
  {
    name: "saved values win over defaults",
    args: [{ theme: "dark", emailDigest: "off" }],
    expected: { theme: "dark", pageSize: 20, emailDigest: "off", locale: "en-US" },
  },
  {
    name: "clamps a huge page size",
    args: [{ pageSize: 500 }],
    expected: { theme: "system", pageSize: 100, emailDigest: "weekly", locale: "en-US" },
  },
  {
    name: "clamps a tiny page size and rounds down",
    args: [{ pageSize: 2.9 }],
    expected: { theme: "system", pageSize: 5, emailDigest: "weekly", locale: "en-US" },
  },
  {
    name: "trims the locale",
    args: [{ locale: "  fr-FR " }],
    expected: { theme: "system", pageSize: 20, emailDigest: "weekly", locale: "fr-FR" },
  },
  {
    name: "null from the database falls back to the default",
    args: [{ theme: null, pageSize: null }],
    expected: { theme: "system", pageSize: 20, emailDigest: "weekly", locale: "en-US" },
    hidden: true,
  },
  {
    name: "a blank locale falls back",
    args: [{ locale: "   ", pageSize: 42.7 }],
    expected: { theme: "system", pageSize: 42, emailDigest: "weekly", locale: "en-US" },
    hidden: true,
  },
];
