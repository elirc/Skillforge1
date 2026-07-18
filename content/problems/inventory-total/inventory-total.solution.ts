type InventoryItem = { quantity: number; price: number };

export function inventoryTotal(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}
