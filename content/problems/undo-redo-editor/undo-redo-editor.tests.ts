import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayEditor";

const insert = (text: string, t: number) => ({ type: "insert", text, t });
const del = (count: number, t: number) => ({ type: "delete", count, t });
const undo = { type: "undo" };
const redo = { type: "redo" };

export const tests: TestCase[] = [
  {
    name: "undo reverts the last edit",
    args: [[insert("Hello", 0), insert(" world", 5000), undo]],
    expected: ["Hello", "Hello world", "Hello"],
  },
  {
    name: "quick inserts undo as one step",
    args: [[insert("a", 0), insert("b", 500), insert("c", 1400), undo]],
    expected: ["a", "ab", "abc", ""],
  },
  {
    name: "redo replays undone edits",
    args: [[insert("x", 0), insert("y", 5000), undo, undo, redo, redo]],
    expected: ["x", "xy", "x", "", "x", "xy"],
  },
  {
    name: "a new edit clears the redo history",
    args: [[insert("a", 0), undo, insert("b", 5000), redo]],
    expected: ["a", "", "b", "b"],
  },
  {
    name: "delete clamps to the document and can be undone",
    args: [[insert("abc", 0), del(5, 100), undo]],
    expected: ["abc", "", "abc"],
  },
  { name: "undo and redo with no history do nothing", args: [[undo, redo]], expected: ["", ""] },
  {
    name: "a delete ends the typing group",
    args: [[insert("ab", 0), del(1, 100), insert("c", 200), undo]],
    expected: ["ab", "a", "ac", "a"],
    hidden: true,
  },
  {
    name: "a delete that removes nothing keeps the redo history",
    args: [[insert("a", 0), undo, del(1, 50), redo]],
    expected: ["a", "", "", "a"],
    hidden: true,
  },
  {
    name: "undo ends the typing group",
    args: [[insert("a", 0), insert("b", 5000), undo, insert("c", 5100), undo]],
    expected: ["a", "ab", "a", "ac", "a"],
    hidden: true,
  },
];
