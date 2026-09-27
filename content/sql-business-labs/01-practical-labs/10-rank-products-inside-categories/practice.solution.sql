SELECT sku,category,DENSE_RANK() OVER(PARTITION BY category ORDER BY price_cents DESC) AS price_rank FROM products ORDER BY category,price_rank,sku;
