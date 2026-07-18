type ListItem = { id?: string | number; label: string };

export function buildListKeys(items: ListItem[]): string[] {
  return items.map((item, index) => (item.id === undefined ? `fallback-${index}` : String(item.id)));
}
