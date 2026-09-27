SELECT sku, stock FROM products WHERE stock <= reorder_at ORDER BY sku;
