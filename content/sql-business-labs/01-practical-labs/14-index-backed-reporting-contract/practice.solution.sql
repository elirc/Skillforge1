SELECT id,total_cents FROM orders WHERE customer_id=$customer AND status='paid' ORDER BY placed_at,id;
