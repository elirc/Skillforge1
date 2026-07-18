type Item = { id: string; name: string };
type SelectOption = { value: string; label: string };

export function toSelectOptions(items: Item[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }));
}
