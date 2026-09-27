export async function doubleAll(values: number[]): Promise<number[]> { return await Promise.all(values.map(async value=>value*2)); }
export function regressionCases() { return [{"args":[[2,3]],"expected":[4,6]},{"args":[[]],"expected":[]},{"args":[[0,-2]],"expected":[0,-4]}]; }
