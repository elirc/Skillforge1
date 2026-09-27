export function total(values: number[]): number { return values.reduce((sum,value)=>sum+value,0); }
export function regressionCases() { return [{"args":[[]],"expected":0},{"args":[[2,3]],"expected":5},{"args":[[-2,2]],"expected":0}]; }
