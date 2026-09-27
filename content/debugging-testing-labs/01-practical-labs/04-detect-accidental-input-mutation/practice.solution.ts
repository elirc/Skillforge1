export function sortSnapshot(values: number[]): { sorted: number[]; original: number[] } { const sorted=[...values].sort((a,b)=>a-b); return {sorted,original:values}; }
export function regressionCases() { return [{"args":[[3,1]],"expected":{"sorted":[1,3],"original":[3,1]}},{"args":[[]],"expected":{"sorted":[],"original":[]}},{"args":[[2,2,1]],"expected":{"sorted":[1,2,2],"original":[2,2,1]}}]; }
