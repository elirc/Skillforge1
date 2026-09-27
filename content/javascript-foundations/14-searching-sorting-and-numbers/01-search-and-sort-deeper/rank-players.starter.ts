interface Player {
  name: string;
  score: number;
}

// Highest score first. Equal scores are ordered by name, A to Z.
// Return the names, and leave the caller's array untouched.
export function rankPlayers(players: Player[]): string[] {
  // Copy first ([...players]), then sort with a comparator:
  // return a negative number when a should come before b.
  return players.map((player) => player.name);
}
