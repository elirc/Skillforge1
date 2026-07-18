type User = { id: string; active: boolean };

export function activeUserCount(items: User[]): number {
  return items.filter((item) => item.active).length;
}
