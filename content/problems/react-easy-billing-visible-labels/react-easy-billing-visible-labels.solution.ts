type ListItem = { label: string; hidden?: boolean };

export function billingVisibleLabels(items: ListItem[]): string[] {
  return items.filter((item) => !item.hidden).map((item) => item.label);
}
