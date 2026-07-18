export function repeatString(text: string, count: number): string {
  let output = "";
  for (let index = 0; index < count; index += 1) {
    output += text;
  }
  return output;
}
