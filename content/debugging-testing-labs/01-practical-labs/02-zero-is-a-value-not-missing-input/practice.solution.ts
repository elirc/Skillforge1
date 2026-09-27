export function quantity(value: number | null): number { return value ?? 1; }
export function regressionCases() { return [{"args":[0],"expected":0},{"args":[null],"expected":1},{"args":[5],"expected":5}]; }
