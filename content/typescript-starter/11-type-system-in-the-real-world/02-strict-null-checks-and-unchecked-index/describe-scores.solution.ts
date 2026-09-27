export function describeScores(scores: Record<string, number[]>, names: string[]): string[] {
  return names.map((name) => {
    const list: number[] | undefined = Object.hasOwn(scores, name) ? scores[name] : undefined;
    if (list === undefined) return name + ": no record";

    const first: number | undefined = list[0];
    const last: number | undefined = list.at(-1);
    if (first === undefined || last === undefined) return name + ": no attempts";

    return name + ": best " + Math.max(...list) + ", first " + first + ", last " + last;
  });
}
