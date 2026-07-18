type Project = { id: string; title: string };
type SelectOption = { value: string; label: string };

export function projectSelectOptions(items: Project[]): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.title }));
}
