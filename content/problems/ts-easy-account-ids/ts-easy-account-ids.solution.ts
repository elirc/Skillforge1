type Account = { id: string; displayName: string };

export function accountIds(items: Account[]): string[] {
  return items.map((item) => item.id);
}
