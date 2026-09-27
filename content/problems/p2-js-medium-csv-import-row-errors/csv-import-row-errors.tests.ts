import type { TestCase } from "@content/_authoring/types";

export const functionName = "importUsers";

export const tests: TestCase[] = [
  {
    name: "imports clean rows and defaults an empty role",
    args: ["name,email,role\nAda,ADA@x.io,admin\nBob,bob@x.io,"],
    expected: {
      imported: [
        { name: "Ada", email: "ada@x.io", role: "admin" },
        { name: "Bob", email: "bob@x.io", role: "viewer" },
      ],
      errors: [],
    },
  },
  {
    name: "collects every field error for a row",
    args: ["name,email,role\n,bad,owner\nCy,cy@x.io,editor"],
    expected: {
      imported: [{ name: "Cy", email: "cy@x.io", role: "editor" }],
      errors: [{ line: 2, errors: ["name is required", "email is invalid", "role must be admin, editor or viewer"] }],
    },
  },
  {
    name: "header columns can be in any order",
    args: ["Email, ROLE ,name\ncy@x.io,viewer,Cy"],
    expected: { imported: [{ name: "Cy", email: "cy@x.io", role: "viewer" }], errors: [] },
  },
  {
    name: "duplicate emails are case-insensitive and point at the first line",
    args: ["name,email,role\nA,a@x.io,viewer\nB,A@X.io,viewer"],
    expected: {
      imported: [{ name: "A", email: "a@x.io", role: "viewer" }],
      errors: [{ line: 3, errors: ["duplicate email (first seen on line 2)"] }],
    },
  },
  {
    name: "blank lines and CRLF keep real line numbers",
    args: ["name,email,role\r\n\r\nA,a@x.io,viewer\r\n\r\nB,nope,viewer\r\n"],
    expected: {
      imported: [{ name: "A", email: "a@x.io", role: "viewer" }],
      errors: [{ line: 5, errors: ["email is invalid"] }],
    },
  },
  {
    name: "a wrong column count reports only that",
    args: ["name,email,role\nA,a@x.io"],
    expected: { imported: [], errors: [{ line: 2, errors: ["expected 3 columns, got 2"] }] },
  },
  {
    name: "a missing header column rejects the file",
    args: ["name,role\nA,viewer"],
    expected: { imported: [], errors: [{ line: 1, errors: ["missing column: email"] }] },
  },
  {
    name: "cells are trimmed and role is case-insensitive",
    args: ["name,email,role\n  Ann , ann@x.io , Editor"],
    expected: { imported: [{ name: "Ann", email: "ann@x.io", role: "editor" }], errors: [] },
    hidden: true,
  },
  {
    name: "a rejected row does not reserve its email",
    args: ["name,email,role\n,a@x.io,viewer\nA,a@x.io,viewer"],
    expected: {
      imported: [{ name: "A", email: "a@x.io", role: "viewer" }],
      errors: [{ line: 2, errors: ["name is required"] }],
    },
    hidden: true,
  },
];
