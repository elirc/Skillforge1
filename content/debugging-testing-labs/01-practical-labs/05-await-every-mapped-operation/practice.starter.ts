export async function doubleAll(values: number[]): Promise<number[]> { return values.map(async value=>value*2) as unknown as number[]; }
export function regressionCases(): {args: unknown[]; expected: unknown}[] { return []; }
