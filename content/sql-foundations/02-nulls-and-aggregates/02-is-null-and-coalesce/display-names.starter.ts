interface UserRow {
  id: number;
  nickname: string | null;
  firstName: string | null;
  deletedAt: string | null;
}

// SELECT id, COALESCE(nickname, first_name, 'Anonymous') AS display_name
// FROM users
// WHERE deleted_at IS NULL
// ORDER BY id
export function displayNames(rows: UserRow[]) {
  return rows.map((row) => ({ id: row.id, displayName: row.nickname || row.firstName || "Anonymous" }));
}
