export type Row = { id: string; [field: string]: string | number | boolean | null };

export function diffRows(before: Row[], after: Row[]) {
  // Index both lists by id, then emit deletes, updates (changed fields only), inserts.
}
