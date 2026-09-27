type Operator = "=" | "!=" | "<" | "<=" | ">" | ">=" | "in" | "like";
type Condition = { column: string; op: Operator; value: unknown };
type QuerySpec = {
  table: string;
  columns?: string[];
  where?: Condition[];
  orderBy?: { column: string; direction?: "asc" | "desc" }[];
  limit?: number;
  offset?: number;
};

export function buildQuery(spec: QuerySpec) {
  // Build SELECT <cols> FROM "<table>" [WHERE ...] [ORDER BY ...] [LIMIT $n] [OFFSET $n]
  // - identifiers must match /^[A-Za-z_][A-Za-z0-9_]*$/ and are double-quoted
  // - every value becomes a numbered placeholder ($1, $2, ...) pushed to params
  // - = null -> IS NULL, != null -> IS NOT NULL, other ops with null are errors
  // - in [] -> 1 = 0; in [a, b] -> "col" IN ($1, $2)
  // Return { ok: true, sql, params } or { ok: false, error }.
}
