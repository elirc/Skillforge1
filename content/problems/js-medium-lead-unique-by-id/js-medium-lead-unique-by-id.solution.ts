type IdItem = { id: string; label: string };

export function leadUniqueById(items: IdItem[]): IdItem[] {
  const seen = new Set<string>();
  const unique: IdItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}
