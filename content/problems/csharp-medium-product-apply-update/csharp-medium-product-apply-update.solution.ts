type Product = { id: string; name: string; isActive: boolean };

export function productApplyUpdate(item: Product, update: Partial<Product>): Product {
  return { ...item, ...update };
}
