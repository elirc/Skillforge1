type Account = { id: string; displayName: string };
type SelectOption = { value: string; label: string };

export function accountSelectOptions(items: Account[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.displayName }));
}
