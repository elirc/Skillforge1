interface UserRow {
  id: number;
  name: string;
  email: string;
  age: number | null;
}

// SELECT id, name FROM users WHERE age >= @minAge
export function selectWhere(rows: UserRow[], minAge: number) {
  // 1. WHERE: keep rows whose age is not NULL and is >= minAge
  // 2. SELECT: project each surviving row to { id, name }
  return rows;
}
