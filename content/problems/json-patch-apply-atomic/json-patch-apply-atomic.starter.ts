export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type PatchOp =
  | { op: "add" | "replace" | "test"; path: string; value: Json }
  | { op: "remove"; path: string }
  | { op: "move" | "copy"; from: string; path: string };

export function applyPatch(doc: Json, ops: PatchOp[]) {
  // Clone first, apply every op to the clone, and return null if any op fails.
}
