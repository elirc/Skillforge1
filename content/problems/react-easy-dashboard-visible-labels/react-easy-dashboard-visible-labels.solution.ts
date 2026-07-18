type ListItem = { label: string; hidden?: boolean };

export function dashboardVisibleLabels(items: ListItem[]): string[] {
  return items.filter((item) => !item.hidden).map((item) => item.label);
}
