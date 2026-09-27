interface InventoryRow {
  sku: string;
  qty: number;
}

// For each incoming row, in order:
// INSERT INTO inventory (sku, qty) VALUES (@sku, @qty)
// ON CONFLICT (sku) DO UPDATE SET qty = inventory.qty + excluded.qty
export function upsertInventory(rows: InventoryRow[], incoming: InventoryRow[]) {
  const table = rows.map((row) => ({ ...row }));
  let inserted = 0;
  let updated = 0;

  for (const excluded of incoming) {
    // The UNIQUE key on sku is what detects the conflict.
    const existing = table.find((row) => row.sku === excluded.sku);
    if (existing) {
      existing.qty = existing.qty + excluded.qty;
      updated += 1;
    } else {
      table.push({ sku: excluded.sku, qty: excluded.qty });
      inserted += 1;
    }
  }

  return { rows: table, inserted, updated };
}
