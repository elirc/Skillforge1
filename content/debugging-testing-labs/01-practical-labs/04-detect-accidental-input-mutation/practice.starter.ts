export function sortSnapshot(values: number[]): { sorted: number[]; original: number[] } { const sorted=values.sort((a,b)=>a-b); return {sorted,original:values}; }
export function regressionCases(): {args: unknown[]; expected: unknown}[] { return []; }
