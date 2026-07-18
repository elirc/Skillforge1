type Account = { id: string; active: boolean };

export function activeAccountCount(items: Account[]): number {
  return items.filter((item) => item.active).length;
}
