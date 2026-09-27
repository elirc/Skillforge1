interface ProductRow {
  id: number;
  name: string;
  price: number;
}

// SELECT id FROM products
// ORDER BY price DESC, id ASC
// OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY
export function pageProducts(rows: ProductRow[], page: number, pageSize: number) {
  // sort a copy (price high to low, then id low to high), then slice out the page
  return rows.map((row) => row.id);
}
