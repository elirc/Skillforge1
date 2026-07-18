type UserValue = { value: number };

export function userTotalValue(items: UserValue[]): number {
  return items.reduce((total, item) => total + item.value, 0);
}
