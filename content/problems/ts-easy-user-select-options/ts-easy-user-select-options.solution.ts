type User = { id: string; name: string };
type SelectOption = { value: string; label: string };

export function userSelectOptions(items: User[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }));
}
