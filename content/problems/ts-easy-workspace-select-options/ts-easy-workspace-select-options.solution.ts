type Workspace = { id: string; name: string };
type SelectOption = { value: string; label: string };

export function workspaceSelectOptions(items: Workspace[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }));
}
