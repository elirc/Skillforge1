interface UserFilters {
  name: string | null;
  city: string | null;
  minAge: number | null;
  sortBy: string | null;
}

// SELECT id, name, city, age FROM users
// [WHERE name = @p0 AND city = @p1 AND age >= @p2]   -- only the non-null filters, in this order
// ORDER BY <name | age | city, else id>
export function buildUserQuery(filters: UserFilters) {
  // Unsafe on purpose: values are pasted into the SQL text. Fix it.
  let sql = "SELECT id, name, city, age FROM users";
  if (filters.name !== null) sql += ` WHERE name = '${filters.name}'`;
  sql += ` ORDER BY ${filters.sortBy ?? "id"}`;
  return { sql, params: [] as unknown[] };
}
