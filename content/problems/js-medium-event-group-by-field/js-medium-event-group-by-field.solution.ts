export function eventGroupByField(items: Record<string, unknown>[], field: string): Record<string, Record<string, unknown>[]> {
  const groups: Record<string, Record<string, unknown>[]> = {};
  for (const item of items) {
    const key = String(item[field]);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
  }
  return groups;
}
