INSERT INTO products(id,sku,category,price_cents,stock,reorder_at) VALUES(9,'BOOK','office',300,0,5) ON CONFLICT(sku) DO UPDATE SET price_cents=excluded.price_cents;
