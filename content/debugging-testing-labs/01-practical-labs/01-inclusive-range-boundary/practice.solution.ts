export function range(end: number): number[] { return Array.from({length: Math.max(0,end+1)},(_,i)=>i); }
export function regressionCases() { return [{"args":[3],"expected":[0,1,2,3]},{"args":[0],"expected":[0]},{"args":[-1],"expected":[]}]; }
