type Product = { id: string; name: string };

export function formatProductSummary(item: Product): string {
  return item.name + " [" + item.id + "]";
}
