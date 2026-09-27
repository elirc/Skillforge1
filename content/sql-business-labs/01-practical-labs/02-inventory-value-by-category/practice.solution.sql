SELECT category, SUM(price_cents * stock) AS value_cents FROM products GROUP BY category ORDER BY category;
