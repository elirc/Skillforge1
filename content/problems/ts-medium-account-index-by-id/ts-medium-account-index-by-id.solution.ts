type Account = { id: string; displayName: string };

export function accountIndexById(items: Account[]): Record<string, Account> {
  const indexed: Record<string, Account> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
