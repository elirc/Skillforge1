type Product = { price: number };

export function productTotalPrice(items: Product[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}
