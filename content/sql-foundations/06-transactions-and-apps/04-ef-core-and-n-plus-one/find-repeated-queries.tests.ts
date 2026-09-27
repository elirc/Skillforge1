import type { TestCase } from "@content/_authoring/types";

export const functionName = "findRepeatedQueries";

export const tests: TestCase[] = [
  {
    name: "finds the per-row query behind an N+1",
    args: [
      [
        "SELECT Id, Name FROM Blogs",
        "SELECT COUNT(*) FROM Posts WHERE BlogId = 1",
        "SELECT COUNT(*) FROM Posts WHERE BlogId = 2",
        "SELECT COUNT(*) FROM Posts WHERE BlogId = 3",
      ],
      3,
    ],
    expected: [{ sql: "SELECT COUNT(*) FROM Posts WHERE BlogId = ?", count: 3 }],
  },
  {
    name: "string literals (with escaped quotes) and whitespace are normalized",
    args: [
      [
        "SELECT * FROM Users WHERE Name = 'Ada'",
        "SELECT *   FROM Users\n WHERE Name = 'O''Brien'",
        "  SELECT * FROM Users WHERE Name = 'Bo'  ",
      ],
      2,
    ],
    expected: [{ sql: "SELECT * FROM Users WHERE Name = ?", count: 3 }],
  },
  {
    name: "sorts by count descending, then sql; parameter names are not literals",
    args: [
      [
        "SELECT * FROM Tags WHERE PostId = @p0",
        "SELECT * FROM Authors WHERE Id = 7",
        "SELECT * FROM Tags WHERE PostId = @p0",
        "SELECT * FROM Authors WHERE Id = 8",
        "SELECT * FROM Comments WHERE PostId = 1.5",
        "SELECT * FROM Tags WHERE PostId = @p0",
      ],
      2,
    ],
    expected: [
      { sql: "SELECT * FROM Tags WHERE PostId = @p0", count: 3 },
      { sql: "SELECT * FROM Authors WHERE Id = ?", count: 2 },
    ],
    hidden: true,
  },
  {
    name: "nothing repeats often enough",
    args: [["SELECT 1", "SELECT * FROM Blogs WHERE Id = 4"], 2],
    expected: [],
    hidden: true,
  },
  {
    name: "ties on count are ordered by sql text",
    args: [
      [
        "SELECT * FROM Posts WHERE Id = 1",
        "SELECT * FROM Blogs WHERE Id = 1",
        "SELECT * FROM Posts WHERE Id = 2",
        "SELECT * FROM Blogs WHERE Id = 2",
      ],
      2,
    ],
    expected: [
      { sql: "SELECT * FROM Blogs WHERE Id = ?", count: 2 },
      { sql: "SELECT * FROM Posts WHERE Id = ?", count: 2 },
    ],
    hidden: true,
  },
];
