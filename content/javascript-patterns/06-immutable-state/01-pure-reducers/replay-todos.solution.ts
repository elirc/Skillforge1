interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Action = { type: "add"; id: number; text: string } | { type: "toggle"; id: number } | { type: "remove"; id: number };

function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [...state, { id: action.id, text: action.text, done: false }];
    case "toggle":
      return state.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo));
    case "remove":
      return state.filter((todo) => todo.id !== action.id);
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
