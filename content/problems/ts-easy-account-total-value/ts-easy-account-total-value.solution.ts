type AccountValue = { value: number };

export function accountTotalValue(items: AccountValue[]): number {
  return items.reduce((total, item) => total + item.value, 0);
}
