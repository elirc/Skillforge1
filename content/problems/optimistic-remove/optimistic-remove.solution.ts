type Item = { id: string; label: string };

export function optimisticRemove(items: Item[], idToRemove: string): Item[] {
  return items.filter((item) => item.id !== idToRemove);
}
