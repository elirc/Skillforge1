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
type BuiltQuery = { ok: true; sql: string; params: unknown[] } | { ok: false; error: string };

class QueryError extends Error {}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function quote(name: string): string {
  if (!IDENTIFIER.test(name)) throw new QueryError(`Invalid identifier: ${name}`);
  return `"${name}"`;
}

export function buildQuery(spec: QuerySpec): BuiltQuery {
  const params: unknown[] = [];
  const bind = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  const condition = ({ column, op, value }: Condition): string => {
    const col = quote(column);
    if (op === "in") {
      if (!Array.isArray(value)) throw new QueryError(`IN requires an array: ${column}`);
      if (value.length === 0) return "1 = 0";
      return `${col} IN (${value.map(bind).join(", ")})`;
    }
    if (value === null) {
      if (op === "=") return `${col} IS NULL`;
      if (op === "!=") return `${col} IS NOT NULL`;
      throw new QueryError(`Cannot compare ${column} with null using ${op}`);
    }
    return `${col} ${op === "like" ? "LIKE" : op} ${bind(value)}`;
  };

  const checkCount = (name: string, value: number) => {
    if (!Number.isInteger(value) || value < 0) throw new QueryError(`Invalid ${name}`);
  };

  try {
    const columns = spec.columns && spec.columns.length > 0 ? spec.columns.map(quote).join(", ") : "*";
    let sql = `SELECT ${columns} FROM ${quote(spec.table)}`;
    if (spec.where && spec.where.length > 0) sql += ` WHERE ${spec.where.map(condition).join(" AND ")}`;
    if (spec.orderBy && spec.orderBy.length > 0) {
      const order = spec.orderBy.map(({ column, direction }) => `${quote(column)} ${direction === "desc" ? "DESC" : "ASC"}`);
      sql += ` ORDER BY ${order.join(", ")}`;
    }
    if (spec.limit !== undefined) {
      checkCount("limit", spec.limit);
      sql += ` LIMIT ${bind(spec.limit)}`;
    }
    if (spec.offset !== undefined) {
      checkCount("offset", spec.offset);
      sql += ` OFFSET ${bind(spec.offset)}`;
    }
    return { ok: true, sql, params };
  } catch (error) {
    if (error instanceof QueryError) return { ok: false, error: error.message };
    throw error;
  }
}
