import type { TestCase } from "@content/_authoring/types";

export const functionName = "ImportAsync";

export const tests: TestCase[] = [
  {
    name: "a clean import opens and closes everything",
    args: [["a.csv", "bb.csv"]],
    expected: [
      "open db",
      "open a.csv",
      "save a.csv (5 rows)",
      "close a.csv",
      "open bb.csv",
      "save bb.csv (6 rows)",
      "close bb.csv",
      "close db",
      "done",
    ],
  },
  {
    name: "an unreadable file is closed, then skipped",
    args: [["corrupt.csv", "a.csv"]],
    expected: [
      "open db",
      "open corrupt.csv",
      "close corrupt.csv",
      "skip corrupt.csv: corrupt.csv is unreadable",
      "open a.csv",
      "save a.csv (5 rows)",
      "close a.csv",
      "close db",
      "done",
    ],
  },
  {
    name: "a fatal error still closes the reader and the connection before aborting",
    args: [["a.csv", "fatal.csv", "b.csv"]],
    expected: [
      "open db",
      "open a.csv",
      "save a.csv (5 rows)",
      "close a.csv",
      "open fatal.csv",
      "close fatal.csv",
      "close db",
      "abort: fatal.csv broke the parser",
    ],
  },
  {
    name: "no files still opens and closes the connection",
    args: [[]],
    expected: ["open db", "close db", "done"],
  },
  {
    name: "a fatal first file",
    args: [["fatal"]],
    expected: ["open db", "open fatal", "close fatal", "close db", "abort: fatal broke the parser"],
  },
  {
    name: "several skips in a row",
    args: [["corrupt-1", "corrupt-2"]],
    expected: [
      "open db",
      "open corrupt-1",
      "close corrupt-1",
      "skip corrupt-1: corrupt-1 is unreadable",
      "open corrupt-2",
      "close corrupt-2",
      "skip corrupt-2: corrupt-2 is unreadable",
      "close db",
      "done",
    ],
    hidden: true,
  },
  {
    name: "skip, then fatal",
    args: [["corrupt", "x", "fatal!"]],
    expected: [
      "open db",
      "open corrupt",
      "close corrupt",
      "skip corrupt: corrupt is unreadable",
      "open x",
      "save x (1 rows)",
      "close x",
      "open fatal!",
      "close fatal!",
      "close db",
      "abort: fatal! broke the parser",
    ],
    hidden: true,
  },
];
