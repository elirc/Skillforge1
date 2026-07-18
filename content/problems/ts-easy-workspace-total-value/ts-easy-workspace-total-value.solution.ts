type WorkspaceValue = { value: number };

export function workspaceTotalValue(items: WorkspaceValue[]): number {
  return items.reduce((total, item) => total + item.value, 0);
}
