export function range(end: number): number[] { return Array.from({length: Math.max(0,end)},(_,i)=>i); }
export function regressionCases(): {args: unknown[]; expected: unknown}[] { return []; }
