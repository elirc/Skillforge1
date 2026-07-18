export function dashboardCheckedIds(selectedIds: string[], id: string, checked: boolean): string[] {
  if (checked) return selectedIds.includes(id) ? selectedIds : [...selectedIds, id];
  return selectedIds.filter((selectedId) => selectedId !== id);
}
