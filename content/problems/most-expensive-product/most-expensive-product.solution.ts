type Product = { name: string; price: number };

export function mostExpensiveProduct(products: Product[]): string {
  if (products.length === 0) return "";
  let best = products[0];
  for (const product of products) {
    if (product.price > best.price) best = product;
  }
  return best.name;
}
