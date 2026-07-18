type Product = { id: string; isActive: boolean };

export function productActiveCount(items: Product[]): number {
  return items.filter((item) => item.isActive).length;
}
