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
  const warnings: string[] = [];
  for (const node of nodes) {
    const isScan = node.operator === "Table Scan" || node.operator === "Clustered Index Scan";
    if (isScan && node.actualRows >= 10000) warnings.push(`scan:${node.id}`);

    const high = Math.max(node.estimatedRows, node.actualRows);
    const low = Math.max(1, Math.min(node.estimatedRows, node.actualRows));
    if (high / low >= 10) warnings.push(`estimate:${node.id}`);

    if (node.operator === "Key Lookup" && node.executions >= 1000) warnings.push(`lookup:${node.id}`);
  }
  return warnings;
}
