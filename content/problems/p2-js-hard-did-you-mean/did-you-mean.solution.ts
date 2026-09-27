function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
}

export function suggest(input: string, commands: string[]): string[] {
  const typed = input.trim().toLowerCase();
  if (commands.some((command) => command.toLowerCase() === typed)) return [];
  const limit = Math.max(1, Math.floor(typed.length / 3));
  return commands
    .map((command) => ({ command, key: command.toLowerCase(), d: distance(typed, command.toLowerCase()) }))
    .filter((entry) => entry.d <= limit)
    .sort((a, b) => a.d - b.d || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .slice(0, 3)
    .map((entry) => entry.command);
}
