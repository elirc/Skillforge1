export const functionName = "query";
export const tests = [
  {
    "name": "business fixture",
    "args": [
      {
        "setup": "CREATE TABLE products(id INTEGER PRIMARY KEY, sku TEXT UNIQUE NOT NULL, category TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents >= 0), stock INTEGER NOT NULL CHECK(stock >= 0), reorder_at INTEGER NOT NULL);\nINSERT INTO products VALUES (1,'BOOK','office',250,5,5),(2,'MUG','home',900,0,2),(3,'PEN','office',150,20,5);"
      }
    ],
    "expected": [
      {
        "sku": "BOOK",
        "stock": 5
      },
      {
        "sku": "MUG",
        "stock": 0
      }
    ],
    "hidden": false
  },
  {
    "name": "changed business data",
    "args": [
      {
        "setup": "CREATE TABLE products(id INTEGER PRIMARY KEY, sku TEXT UNIQUE NOT NULL, category TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents >= 0), stock INTEGER NOT NULL CHECK(stock >= 0), reorder_at INTEGER NOT NULL);\nINSERT INTO products VALUES (1,'BOOK','office',250,5,5),(2,'MUG','home',900,0,2),(3,'PEN','office',150,20,5);\nUPDATE products SET stock=100;"
      }
    ],
    "expected": [],
    "hidden": false
  }
];
