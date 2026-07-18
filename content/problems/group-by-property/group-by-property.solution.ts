export function groupByProperty(items: Record<string, unknown>[], property: string): Record<string, Record<string, unknown>[]> {
  const groups: Record<string, Record<string, unknown>[]> = {};
  for (const item of items) {
    const key = String(item[property]);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
  }
  return groups;
}
