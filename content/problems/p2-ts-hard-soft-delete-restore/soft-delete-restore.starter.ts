export type TrashRecord = { id: string; slug: string; parentId: string | null; deletedAt: number | null };
export type TrashOp =
  | { type: "delete"; id: string; at: number }
  | { type: "restore"; id: string; at: number }
  | { type: "purge"; at: number };

export function replayTrash(records: TrashRecord[], ops: TrashOp[]) {
  // Work on copies. Delete cascades to active descendants with the same deletedAt.
  // Restore: not found / not deleted / retention expired / parent deleted / slug taken,
  // then restore descendants that share the old deletedAt (skip slug conflicts and their subtrees).
  // Purge removes records deleted more than 30 days ago.
}
