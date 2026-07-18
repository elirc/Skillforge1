type Product = { id: string; name: string };

export function productIndexById(items: Product[]): Record<string, Product> {
  const indexed: Record<string, Product> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
