type User = { id: string; name: string };

export function userIds(items: User[]): string[] {
  return items.map((item) => item.id);
}
