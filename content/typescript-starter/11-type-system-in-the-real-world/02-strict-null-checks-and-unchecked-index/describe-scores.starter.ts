// Output per name:
//   no entry in scores   -> "<name>: no record"
//   an empty list        -> "<name>: no attempts"
//   otherwise            -> "<name>: best <max>, first <first>, last <last>"
// TODO: this version assumes every lookup and index succeeds. Handle the
// missing cases (under noUncheckedIndexedAccess these reads are T | undefined).
export function describeScores(scores: Record<string, number[]>, names: string[]): string[] {
  return names.map((name) => {
    const list = scores[name];
    const first = list[0];
    const last = list[list.length - 1];
    return name + ": best " + Math.max(...list) + ", first " + first + ", last " + last;
  });
}
