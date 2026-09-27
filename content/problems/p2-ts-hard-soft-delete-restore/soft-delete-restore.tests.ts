import type { TestCase } from "@content/_authoring/types";

export const functionName = "replayTrash";

const rec = (id: string, slug: string, parentId: string | null, deletedAt: number | null = null) => ({ id, slug, parentId, deletedAt });
const tree = [rec("f1", "docs", null), rec("f2", "docs-api", "f1"), rec("f3", "docs-api-v1", "f2"), rec("f4", "blog", null)];

export const tests: TestCase[] = [
  {
    name: "deleting a folder cascades to its descendants",
    args: [tree, [{ type: "delete", id: "f1", at: 1 }]],
    expected: { log: ["delete f1 (+2 children)"], active: ["f4"] },
  },
  {
    name: "restoring brings the cascade back",
    args: [
      tree,
      [
        { type: "delete", id: "f1", at: 1 },
        { type: "restore", id: "f1", at: 10 },
      ],
    ],
    expected: { log: ["delete f1 (+2 children)", "restore f1 (+2 children)"], active: ["f1", "f2", "f3", "f4"] },
  },
  {
    name: "children deleted separately are restored separately",
    args: [
      tree,
      [
        { type: "delete", id: "f2", at: 1 },
        { type: "delete", id: "f1", at: 5 },
        { type: "restore", id: "f1", at: 6 },
        { type: "restore", id: "f2", at: 7 },
      ],
    ],
    expected: {
      log: ["delete f2 (+1 children)", "delete f1 (+0 children)", "restore f1 (+0 children)", "restore f2 (+1 children)"],
      active: ["f1", "f2", "f3", "f4"],
    },
  },
  {
    name: "a child cannot be restored into a deleted parent",
    args: [
      tree,
      [
        { type: "delete", id: "f1", at: 1 },
        { type: "restore", id: "f2", at: 2 },
      ],
    ],
    expected: { log: ["delete f1 (+2 children)", "restore f2: parent f1 is deleted"], active: ["f4"] },
  },
  {
    name: "retention expires after 30 days",
    args: [
      tree,
      [
        { type: "delete", id: "f4", at: 1 },
        { type: "restore", id: "f4", at: 32 },
      ],
    ],
    expected: { log: ["delete f4 (+0 children)", "restore f4: retention expired"], active: ["f1", "f2", "f3"] },
  },
  {
    name: "a restored slug must be free",
    args: [[...tree, rec("f5", "blog", null, 0)], [{ type: "restore", id: "f5", at: 3 }]],
    expected: { log: ["restore f5: slug taken by f4"], active: ["f1", "f2", "f3", "f4"] },
  },
  {
    name: "not found, not deleted and already deleted",
    args: [
      tree,
      [
        { type: "delete", id: "x", at: 1 },
        { type: "restore", id: "f4", at: 1 },
        { type: "delete", id: "f4", at: 2 },
        { type: "delete", id: "f4", at: 3 },
      ],
    ],
    expected: {
      log: ["delete x: not found", "restore f4: not deleted", "delete f4 (+0 children)", "delete f4: already deleted"],
      active: ["f1", "f2", "f3"],
    },
  },
  {
    name: "purge removes expired records for good",
    args: [
      tree,
      [
        { type: "delete", id: "f4", at: 1 },
        { type: "purge", at: 40 },
        { type: "restore", id: "f4", at: 41 },
      ],
    ],
    expected: { log: ["delete f4 (+0 children)", "purge: 1 removed", "restore f4: not found"], active: ["f1", "f2", "f3"] },
    hidden: true,
  },
  {
    name: "exactly 30 days is still inside retention",
    args: [
      tree,
      [
        { type: "delete", id: "f4", at: 1 },
        { type: "purge", at: 31 },
        { type: "restore", id: "f4", at: 31 },
      ],
    ],
    expected: { log: ["delete f4 (+0 children)", "purge: 0 removed", "restore f4 (+0 children)"], active: ["f1", "f2", "f3", "f4"] },
    hidden: true,
  },
  {
    name: "a cascaded child with a taken slug is skipped",
    args: [[rec("p", "p", null, 5), rec("c", "x", "p", 5), rec("o", "x", null)], [{ type: "restore", id: "p", at: 6 }]],
    expected: { log: ["restore p (+0 children, 1 skipped)"], active: ["o", "p"] },
    hidden: true,
  },
];
