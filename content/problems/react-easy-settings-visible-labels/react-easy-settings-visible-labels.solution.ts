type ListItem = { label: string; hidden?: boolean };

export function settingsVisibleLabels(items: ListItem[]): string[] {
  return items.filter((item) => !item.hidden).map((item) => item.label);
}
