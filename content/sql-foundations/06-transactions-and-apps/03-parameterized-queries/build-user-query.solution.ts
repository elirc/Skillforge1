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
  const conditions: string[] = [];
  const params: unknown[] = [];

  // Values only ever go into params; the SQL text holds placeholders.
  const add = (template: string, value: unknown) => {
    conditions.push(template.replace("?", `@p${params.length}`));
    params.push(value);
  };

  if (filters.name !== null) add("name = ?", filters.name);
  if (filters.city !== null) add("city = ?", filters.city);
  if (filters.minAge !== null) add("age >= ?", filters.minAge);

  // Identifiers cannot be parameters, so they come from an allow-list.
  const sortable = ["name", "age", "city"];
  const orderBy = filters.sortBy !== null && sortable.includes(filters.sortBy) ? filters.sortBy : "id";

  let sql = "SELECT id, name, city, age FROM users";
  if (conditions.length > 0) sql += ` WHERE ${conditions.join(" AND ")}`;
  sql += ` ORDER BY ${orderBy}`;

  return { sql, params };
}
