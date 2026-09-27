// CREATE INDEX IX ON t (indexColumns[0], indexColumns[1], ...)
// SELECT ... FROM t WHERE <eq col> = @x AND ... AND <range col> > @y
//
// How many leading index key columns can an index seek use?
export function seekPrefixLength(indexColumns: string[], equalityColumns: string[], rangeColumn: string | null) {
  // walk indexColumns in order: equality -> count and continue,
  // range -> count and stop, anything else -> stop
  return equalityColumns.length + (rangeColumn === null ? 0 : 1);
}
