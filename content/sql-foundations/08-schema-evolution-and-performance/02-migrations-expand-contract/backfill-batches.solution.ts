interface UserRow {
  id: number;
  fullName: string;
  displayName: string | null;
}

// -- Expand step 2: backfill the new nullable column in small keyset batches
// DECLARE @lastId int = 0;
// WHILE 1 = 1 BEGIN
//   UPDATE u SET display_name = full_name
//   FROM (SELECT TOP (@batchSize) * FROM users
//         WHERE id > @lastId AND display_name IS NULL ORDER BY id) AS u;
//   IF @@ROWCOUNT = 0 BREAK;
//   SET @lastId = (max id just updated);
// END
export function backfillBatches(users: UserRow[], batchSize: number) {
  const pending = users
    .filter((u) => u.displayName === null)
    .map((u) => u.id)
    .sort((a, b) => a - b);

  const batches: number[][] = [];
  for (let i = 0; i < pending.length; i += batchSize) {
    batches.push(pending.slice(i, i + batchSize));
  }

  const rows = [...users]
    .sort((a, b) => a.id - b.id)
    .map((u) => ({ ...u, displayName: u.displayName ?? u.fullName }));

  // Only once no NULLs remain is it safe to ALTER COLUMN ... NOT NULL.
  return { batches, rows, readyForNotNull: rows.every((u) => u.displayName !== null) };
}
