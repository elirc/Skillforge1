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
  // Bug on purpose: one giant UPDATE touches every row in a single batch (long locks, huge log).
  // Only rows with a NULL displayName need work; chunk their ids (ascending) into batches.
  const batches: number[][] = [users.map((u) => u.id)];
  const rows = users.map((u) => ({ ...u, displayName: u.fullName }));
  return { batches, rows, readyForNotNull: true };
}
