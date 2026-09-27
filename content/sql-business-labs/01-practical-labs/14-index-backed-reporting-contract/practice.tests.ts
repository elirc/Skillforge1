export const functionName = "query";
export const tests = [
  {
    "name": "business fixture",
    "args": [
      {
        "setup": "CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);\nCREATE INDEX ix_orders_customer_status_date ON orders(customer_id,status,placed_at,id);",
        "params": {
          "$customer": 1
        }
      }
    ],
    "expected": [
      {
        "id": 10,
        "total_cents": 1200
      },
      {
        "id": 13,
        "total_cents": 400
      }
    ],
    "hidden": false
  },
  {
    "name": "changed business data",
    "args": [
      {
        "setup": "CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);\nCREATE INDEX ix_orders_customer_status_date ON orders(customer_id,status,placed_at,id);\nINSERT INTO orders VALUES(14,1,'paid','2026-01-04',250);",
        "params": {
          "$customer": 1
        }
      }
    ],
    "expected": [
      {
        "id": 10,
        "total_cents": 1200
      },
      {
        "id": 13,
        "total_cents": 400
      },
      {
        "id": 14,
        "total_cents": 250
      }
    ],
    "hidden": false
  }
];
