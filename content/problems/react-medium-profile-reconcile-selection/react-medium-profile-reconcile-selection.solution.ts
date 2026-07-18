type Row = { id: string };

export function profileReconcileSelection(selectedIds: string[], rows: Row[]): string[] {
  const visibleIds = new Set(rows.map((row) => row.id));
  return selectedIds.filter((id) => visibleIds.has(id));
}
