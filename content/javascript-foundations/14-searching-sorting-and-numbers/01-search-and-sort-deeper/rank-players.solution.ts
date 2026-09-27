interface Player {
  name: string;
  score: number;
}

// Highest score first. Equal scores are ordered by name, A to Z.
// Return the names, and leave the caller's array untouched.
export function rankPlayers(players: Player[]): string[] {
  return [...players]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // bigger score first
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    .map((player) => player.name);
}
