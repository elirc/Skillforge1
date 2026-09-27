UPDATE products SET stock=stock-$quantity WHERE sku=$sku AND $quantity>0 AND stock >= $quantity;
