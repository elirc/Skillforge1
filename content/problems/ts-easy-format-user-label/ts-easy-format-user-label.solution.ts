type User = { id: string; name: string };

export function formatUserLabel(item: User): string {
  return item.name + " (" + item.id + ")";
}
