type Team = { id: string; label: string };
type SelectOption = { value: string; label: string };

export function teamSelectOptions(items: Team[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.label }));
}
