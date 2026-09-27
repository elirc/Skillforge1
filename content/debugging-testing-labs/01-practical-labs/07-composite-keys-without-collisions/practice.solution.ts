export function countPairs(pairs: string[][]): number { return new Set(pairs.map(pair=>JSON.stringify(pair))).size; }
export function regressionCases() { return [{"args":[[["ab","c"],["a","bc"]]],"expected":2},{"args":[[["x","y"],["x","y"]]],"expected":1},{"args":[[]],"expected":0}]; }
