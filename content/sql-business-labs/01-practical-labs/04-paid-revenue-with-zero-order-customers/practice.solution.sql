SELECT c.id, c.name, COALESCE(SUM(o.total_cents),0) AS revenue_cents FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='paid' GROUP BY c.id,c.name ORDER BY c.id;
