export const functionName = "query";
export const tests = [
  {
    "name": "business fixture",
    "args": [
      {
        "setup": "PRAGMA foreign_keys=ON;\nCREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);"
      }
    ],
    "expected": [
      {
        "id": 1,
        "order_count": 3
      },
      {
        "id": 2,
        "order_count": 1
      },
      {
        "id": 3,
        "order_count": 0
      }
    ],
    "hidden": false
  },
  {
    "name": "changed business data",
    "args": [
      {
        "setup": "PRAGMA foreign_keys=ON;\nCREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);\nDELETE FROM orders WHERE customer_id=1;"
      }
    ],
    "expected": [
      {
        "id": 1,
        "order_count": 0
      },
      {
        "id": 2,
        "order_count": 1
      },
      {
        "id": 3,
        "order_count": 0
      }
    ],
    "hidden": false
  }
];
