export const functionName = "query";
export const tests = [
  {
    "name": "business fixture",
    "args": [
      {
        "setup": "CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);"
      }
    ],
    "expected": [
      {
        "id": 1,
        "name": "Ada",
        "revenue_cents": 1600
      },
      {
        "id": 2,
        "name": "Bo",
        "revenue_cents": 800
      },
      {
        "id": 3,
        "name": "Cy",
        "revenue_cents": 0
      }
    ],
    "hidden": false
  },
  {
    "name": "changed business data",
    "args": [
      {
        "setup": "CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);\nUPDATE orders SET status='cancelled';"
      }
    ],
    "expected": [
      {
        "id": 1,
        "name": "Ada",
        "revenue_cents": 0
      },
      {
        "id": 2,
        "name": "Bo",
        "revenue_cents": 0
      },
      {
        "id": 3,
        "name": "Cy",
        "revenue_cents": 0
      }
    ],
    "hidden": false
  }
];
