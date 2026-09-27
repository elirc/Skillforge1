import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseCsv";

export const tests: TestCase[] = [
  {
    name: "parses plain records",
    args: ["id,name\n1,Ada\n2,Grace"],
    expected: [
      ["id", "name"],
      ["1", "Ada"],
      ["2", "Grace"],
    ],
  },
  {
    name: "keeps commas inside quotes",
    args: ['sku,title\nA1,"Desk, oak"'],
    expected: [
      ["sku", "title"],
      ["A1", "Desk, oak"],
    ],
  },
  {
    name: "unescapes doubled quotes",
    args: ['1,"She said ""hi"""'],
    expected: [["1", 'She said "hi"']],
  },
  {
    name: "keeps line breaks inside quotes",
    args: ['1,"line one\nline two",x'],
    expected: [["1", "line one\nline two", "x"]],
  },
  {
    name: "handles CRLF and a trailing line break",
    args: ["a,b\r\nc,d\r\n"],
    expected: [
      ["a", "b"],
      ["c", "d"],
    ],
  },
  {
    name: "keeps empty fields",
    args: [",a,,\n"],
    expected: [["", "a", "", ""]],
  },
  {
    name: "an unterminated quote is an error",
    args: ['1,"oops'],
    expected: null,
  },
  { name: "empty input has no records", args: [""], expected: [], hidden: true },
  {
    name: "a quoted empty field still counts",
    args: ['a,""\n""'],
    expected: [["a", ""], [""]],
    hidden: true,
  },
  {
    name: "a blank line in the middle is a record with one empty field",
    args: ["a\n\nb"],
    expected: [["a"], [""], ["b"]],
    hidden: true,
  },
  {
    name: "CRLF inside quotes is preserved",
    args: ['"x\r\ny",z'],
    expected: [["x\r\ny", "z"]],
    hidden: true,
  },
];
