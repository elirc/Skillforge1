type TeamValue = { value: number };

export function teamTotalValue(items: TeamValue[]): number {
  return items.reduce((total, item) => total + item.value, 0);
}
