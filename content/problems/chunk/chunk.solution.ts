export function chunk(items: number[], size: number): number[][] {
  const groups: number[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}
