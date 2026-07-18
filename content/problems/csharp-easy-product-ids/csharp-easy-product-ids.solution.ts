type Product = { id: string; name: string };

export function productIds(items: Product[]): string[] {
  return items.map((item) => item.id);
}
