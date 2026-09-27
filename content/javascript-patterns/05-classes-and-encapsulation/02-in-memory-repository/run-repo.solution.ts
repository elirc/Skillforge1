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
  #items = new Map<number, Item>();
  #nextId = 1;

  add(name: string): number {
    const id = this.#nextId++;
    this.#items.set(id, { id, name });
    return id;
  }

  get(id: number): Item | null {
    const item = this.#items.get(id);
    return item ? { ...item } : null;
  }

  rename(id: number, name: string): boolean {
    const item = this.#items.get(id);
    if (!item) return false;
    this.#items.set(id, { ...item, name });
    return true;
  }

  remove(id: number): boolean {
    return this.#items.delete(id);
  }

  list(): Item[] {
    return [...this.#items.values()].sort((a, b) => a.id - b.id).map((item) => ({ ...item }));
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
