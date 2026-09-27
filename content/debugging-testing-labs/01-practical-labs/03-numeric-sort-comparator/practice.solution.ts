export function sortScores(values: number[]): number[] { return [...values].sort((a,b)=>a-b); }
export function regressionCases() { return [{"args":[[10,2,1]],"expected":[1,2,10]},{"args":[[]],"expected":[]},{"args":[[-1,3,0]],"expected":[-1,0,3]}]; }
