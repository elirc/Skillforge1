interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Action = { type: "add"; id: number; text: string } | { type: "toggle"; id: number } | { type: "remove"; id: number };

// This reducer mutates `state`, so every snapshot in the history ends up
// pointing at the same array. Rewrite each branch to return a NEW array (and a
// new object for the toggled todo) without changing the old one.
function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      state.push({ id: action.id, text: action.text, done: false });
      return state;
    case "toggle": {
      const todo = state.find((t) => t.id === action.id);
      if (todo) todo.done = !todo.done;
      return state;
    }
    case "remove": {
      const index = state.findIndex((t) => t.id === action.id);
      if (index >= 0) state.splice(index, 1);
      return state;
    }
    default:
      return state;
  }
}

export function replayTodos(actions: Action[]): Todo[][] {
  const history: Todo[][] = [];
  let state: Todo[] = [];
  for (const action of actions) {
    state = todosReducer(state, action);
    history.push(state);
  }
  return history;
}
