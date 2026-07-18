type ProjectValue = { value: number };

export function projectTotalValue(items: ProjectValue[]): number {
  return items.reduce((total, item) => total + item.value, 0);
}
