// CREATE INDEX IX ON t (indexColumns[0], indexColumns[1], ...)
// SELECT ... FROM t WHERE <eq col> = @x AND ... AND <range col> > @y
//
// How many leading index key columns can an index seek use?
export function seekPrefixLength(indexColumns: string[], equalityColumns: string[], rangeColumn: string | null): number {
  const equality = new Set(equalityColumns);
  let usable = 0;

  for (const column of indexColumns) {
    if (equality.has(column)) {
      // Equality pins one value, so the next key column is still sorted within it.
      usable += 1;
      continue;
    }
    if (column === rangeColumn) {
      // A range spans many values of this column; later columns are no longer sorted across it.
      usable += 1;
    }
    // A range column ends the seek prefix, and so does a column with no predicate.
    break;
  }

  return usable;
}
