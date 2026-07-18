type Item = { id: string; selected: boolean; selectedCount: number };

export function settingsOptimisticCount(item: Item): Item {
  const selected = !item.selected;
  return { ...item, selected, selectedCount: item.selectedCount + (selected ? 1 : -1) };
}
