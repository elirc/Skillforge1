export function validParentheses(input: string): boolean {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const openings = new Set(Object.values(pairs));
  const stack: string[] = [];

  for (const char of input) {
    if (openings.has(char)) {
      stack.push(char);
    } else if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false;
    }
  }

  return stack.length === 0;
}
