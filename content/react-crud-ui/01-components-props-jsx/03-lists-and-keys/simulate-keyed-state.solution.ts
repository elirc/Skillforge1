interface RenderedRow {
  id: number;
  label: string;
  draft: string;
}

interface Item {
  id: number;
  label: string;
}

interface Result {
  rows: { key: string; label: string; draft: string }[];
  unmountedKeys: string[];
}

export function simulateKeyedState(prevRows: RenderedRow[], nextItems: Item[], keyMode: "index" | "id"): Result {
  const keyOf = (item: Item, index: number) => (keyMode === "index" ? String(index) : String(item.id));

  // React keeps each row's state under its key.
  const stateByKey = new Map<string, string>();
  prevRows.forEach((row, index) => stateByKey.set(keyOf(row, index), row.draft));

  const nextKeys = new Set<string>();
  const rows = nextItems.map((item, index) => {
    const key = keyOf(item, index);
    nextKeys.add(key);
    // Same key -> same component instance -> same state. New key -> fresh useState("").
    return { key, label: item.label, draft: stateByKey.get(key) ?? "" };
  });

  const unmountedKeys = prevRows.map((row, index) => keyOf(row, index)).filter((key) => !nextKeys.has(key));

  return { rows, unmountedKeys };
}
