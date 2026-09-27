export const functionName = "query";
export const tests = [
  {
    "name": "business fixture",
    "args": [
      {
        "setup": "CREATE TABLE products(id INTEGER PRIMARY KEY, sku TEXT UNIQUE NOT NULL, category TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents >= 0), stock INTEGER NOT NULL CHECK(stock >= 0), reorder_at INTEGER NOT NULL);\nINSERT INTO products VALUES (1,'BOOK','office',250,5,5),(2,'MUG','home',900,0,2),(3,'PEN','office',150,20,5);",
        "params": {
          "$after": 1,
          "$limit": 2
        }
      }
    ],
    "expected": [
      {
        "id": 2,
        "sku": "MUG"
      },
      {
        "id": 3,
        "sku": "PEN"
      }
    ],
    "hidden": false
  },
  {
    "name": "changed business data",
    "args": [
      {
        "setup": "CREATE TABLE products(id INTEGER PRIMARY KEY, sku TEXT UNIQUE NOT NULL, category TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents >= 0), stock INTEGER NOT NULL CHECK(stock >= 0), reorder_at INTEGER NOT NULL);\nINSERT INTO products VALUES (1,'BOOK','office',250,5,5),(2,'MUG','home',900,0,2),(3,'PEN','office',150,20,5);\nDELETE FROM products WHERE id=2;",
        "params": {
          "$after": 1,
          "$limit": 2
        }
      }
    ],
    "expected": [
      {
        "id": 3,
        "sku": "PEN"
      }
    ],
    "hidden": false
  }
];
