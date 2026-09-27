interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface Command {
  type: string; // "add" | "toggle" | "rename" | "remove" | "clearDone"
  id?: number;
  text?: string;
}

// Apply each command in order and return the final list plus how many are not done.
export function runTodos(commands: Command[]) {
  let todos: Todo[] = [];
  let nextId = 1; // ids are never reused, even after a remove

  for (const command of commands) {
    if (command.type === "add") {
      todos = [...todos, { id: nextId, text: command.text ?? "", done: false }];
      nextId += 1;
    }
    // TODO: trim text and ignore blank adds/renames,
    // then handle "toggle", "rename", "remove", and "clearDone".
  }

  return { todos, remaining: todos.length };
}
