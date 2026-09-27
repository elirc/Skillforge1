export function shortestPath(grid: string[], k: number): number {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  let start: [number, number] | null = null;
  for (let r = 0; r < rows; r++) {
    const c = grid[r].indexOf("S");
    if (c >= 0) start = [r, c];
  }
  if (!start) return -1;

  const seen = new Set<string>([`${start[0]},${start[1]},0`]);
  let frontier: [number, number, number][] = [[start[0], start[1], 0]];
  let steps = 0;
  const moves = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (frontier.length > 0) {
    const nextFrontier: [number, number, number][] = [];
    for (const [r, c, used] of frontier) {
      if (grid[r][c] === "E") return steps;
      for (const [dr, dc] of moves) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const nextUsed = used + (grid[nr][nc] === "#" ? 1 : 0);
        if (nextUsed > k) continue;
        const key = `${nr},${nc},${nextUsed}`;
        if (seen.has(key)) continue;
        seen.add(key);
        nextFrontier.push([nr, nc, nextUsed]);
      }
    }
    frontier = nextFrontier;
    steps++;
  }
  return -1;
}
