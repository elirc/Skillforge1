SELECT id,total_cents FROM orders WHERE placed_at >= $from AND placed_at < $until ORDER BY placed_at,id;
