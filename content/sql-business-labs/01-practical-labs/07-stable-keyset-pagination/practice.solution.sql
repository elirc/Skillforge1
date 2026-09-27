SELECT id,sku FROM products WHERE id > $after ORDER BY id LIMIT $limit;
