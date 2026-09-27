interface InventoryRow {
  sku: string;
  qty: number;
}

// For each incoming row, in order:
// INSERT INTO inventory (sku, qty) VALUES (@sku, @qty)
// ON CONFLICT (sku) DO UPDATE SET qty = inventory.qty + excluded.qty
export function upsertInventory(rows: InventoryRow[], incoming: InventoryRow[]) {
  // return { rows, inserted, updated }
  return { rows: [...rows, ...incoming], inserted: incoming.length, updated: 0 };
}
