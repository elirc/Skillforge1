type User = { id: string; name: string };

export function userIndexById(items: User[]): Record<string, User> {
  const indexed: Record<string, User> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
