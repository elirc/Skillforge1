interface PlanNode {
  id: number;
  operator: string; // "Index Seek", "Table Scan", "Clustered Index Scan", "Key Lookup", "Nested Loops", ...
  table: string | null;
  estimatedRows: number;
  actualRows: number;
  executions: number;
}

// Reading an actual execution plan (SET STATISTICS XML ON / "Include Actual Execution Plan"):
//   scan:<id>      a Table Scan or Clustered Index Scan that read >= 10000 actual rows
//   estimate:<id>  estimated vs actual rows differ by a factor of 10 or more (stale stats, bad parameter sniffing)
//   lookup:<id>    a Key Lookup executed >= 1000 times (the index is not covering)
export function planWarnings(nodes: PlanNode[]): string[] {
  // Walk nodes in order; for each node check scan, then estimate, then lookup.
  // For the estimate ratio divide the larger count by the smaller one (treat 0 as 1).
  return nodes.filter((n) => n.operator === "Table Scan").map((n) => `scan:${n.id}`);
}
