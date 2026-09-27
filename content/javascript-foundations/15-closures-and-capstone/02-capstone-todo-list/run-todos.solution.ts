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
    const text = (command.text ?? "").trim();

    if (command.type === "add") {
      if (text === "") continue; // guard clause: ignore blank todos
      todos = [...todos, { id: nextId, text, done: false }];
      nextId += 1;
    } else if (command.type === "toggle") {
      todos = todos.map((todo) => (todo.id === command.id ? { ...todo, done: !todo.done } : todo));
    } else if (command.type === "rename") {
      if (text === "") continue;
      todos = todos.map((todo) => (todo.id === command.id ? { ...todo, text } : todo));
    } else if (command.type === "remove") {
      todos = todos.filter((todo) => todo.id !== command.id);
    } else if (command.type === "clearDone") {
      todos = todos.filter((todo) => !todo.done);
    }
    // Anything else is ignored.
  }

  const remaining = todos.filter((todo) => !todo.done).length;
  return { todos, remaining };
}
