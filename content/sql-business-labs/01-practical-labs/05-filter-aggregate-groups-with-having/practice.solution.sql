SELECT customer_id, SUM(total_cents) AS revenue_cents FROM orders WHERE status='paid' GROUP BY customer_id HAVING SUM(total_cents) >= 1000 ORDER BY customer_id;
