export const functionName = "query";
export const tests = [
  {
    "name": "business fixture",
    "args": [
      {
        "setup": "CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);",
        "params": {
          "$from": "2026-01-02",
          "$until": "2026-01-04"
        }
      }
    ],
    "expected": [
      {
        "id": 11,
        "total_cents": 500
      },
      {
        "id": 12,
        "total_cents": 800
      }
    ],
    "hidden": false
  },
  {
    "name": "changed business data",
    "args": [
      {
        "setup": "CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, placed_at TEXT NOT NULL, total_cents INTEGER NOT NULL);\nINSERT INTO customers VALUES(1,'Ada'),(2,'Bo'),(3,'Cy');\nINSERT INTO orders VALUES(10,1,'paid','2026-01-01',1200),(11,1,'cancelled','2026-01-02',500),(12,2,'paid','2026-01-03',800),(13,1,'paid','2026-01-04',400);\nINSERT INTO orders VALUES(14,2,'paid','2026-01-04',200);",
        "params": {
          "$from": "2026-01-02",
          "$until": "2026-01-04"
        }
      }
    ],
    "expected": [
      {
        "id": 11,
        "total_cents": 500
      },
      {
        "id": 12,
        "total_cents": 800
      }
    ],
    "hidden": false
  }
];
