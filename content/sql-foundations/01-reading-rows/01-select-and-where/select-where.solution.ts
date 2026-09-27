interface UserRow {
  id: number;
  name: string;
  email: string;
  age: number | null;
}

// SELECT id, name FROM users WHERE age >= @minAge
export function selectWhere(rows: UserRow[], minAge: number): { id: number; name: string }[] {
  return rows
    // NULL >= minAge is UNKNOWN, and WHERE only keeps TRUE.
    .filter((row) => row.age !== null && row.age >= minAge)
    .map((row) => ({ id: row.id, name: row.name }));
}
