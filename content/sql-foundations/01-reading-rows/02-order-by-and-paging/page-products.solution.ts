interface ProductRow {
  id: number;
  name: string;
  price: number;
}

// SELECT id FROM products
// ORDER BY price DESC, id ASC
// OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY
export function pageProducts(rows: ProductRow[], page: number, pageSize: number): number[] {
  const sorted = [...rows].sort((a, b) => b.price - a.price || a.id - b.id);
  const offset = (page - 1) * pageSize;
  return sorted.slice(offset, offset + pageSize).map((row) => row.id);
}
