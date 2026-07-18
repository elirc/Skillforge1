type Item = { id: string; name: string };

export function indexById(items: Item[]): Record<string, Item> {
  const indexed: Record<string, Item> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
