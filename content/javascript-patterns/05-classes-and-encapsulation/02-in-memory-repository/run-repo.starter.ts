interface Item {
  id: number;
  name: string;
}

type Command =
  | { op: "add"; name: string }
  | { op: "get"; id: number }
  | { op: "rename"; id: number; name: string }
  | { op: "remove"; id: number }
  | { op: "list" };

class InMemoryRepo {
  // Store items in a private #items Map keyed by id, and hand out ids from a
  // private #nextId counter starting at 1. Return copies, never the stored objects.

  add(name: string): number {
    return 0;
  }

  get(id: number): Item | null {
    return null;
  }

  rename(id: number, name: string): boolean {
    return false;
  }

  remove(id: number): boolean {
    return false;
  }

  list(): Item[] {
    return [];
  }
}

export function runRepo(commands: Command[]): unknown[] {
  const repo = new InMemoryRepo();
  return commands.map((command) => {
    switch (command.op) {
      case "add":
        return repo.add(command.name);
      case "get":
        return repo.get(command.id);
      case "rename":
        return repo.rename(command.id, command.name);
      case "remove":
        return repo.remove(command.id);
      case "list":
        return repo.list();
    }
  });
}
