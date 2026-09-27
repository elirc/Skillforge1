BEGIN; UPDATE products SET stock=stock-2 WHERE sku='BOOK' AND stock>=2; INSERT INTO audit(sku,delta) SELECT 'BOOK',-2 WHERE changes()=1; COMMIT;
