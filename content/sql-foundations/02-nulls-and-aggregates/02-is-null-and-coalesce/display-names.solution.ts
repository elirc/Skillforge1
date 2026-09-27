interface UserRow {
  id: number;
  nickname: string | null;
  firstName: string | null;
  deletedAt: string | null;
}

/** COALESCE: the first argument that is not NULL (an empty string counts as a value). */
function coalesce<T>(...values: (T | null)[]): T | null {
  for (const value of values) {
    if (value !== null) return value;
  }
  return null;
}

// SELECT id, COALESCE(nickname, first_name, 'Anonymous') AS display_name
// FROM users
// WHERE deleted_at IS NULL
// ORDER BY id
export function displayNames(rows: UserRow[]): { id: number; displayName: string | null }[] {
  return rows
    .filter((row) => row.deletedAt === null)
    .sort((a, b) => a.id - b.id)
    .map((row) => ({ id: row.id, displayName: coalesce(row.nickname, row.firstName, "Anonymous") }));
}
