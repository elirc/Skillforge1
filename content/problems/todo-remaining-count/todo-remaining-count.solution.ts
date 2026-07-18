type Todo = { id: string; text: string; completed: boolean };

export function todoRemainingCount(todos: Todo[]): number {
  return todos.filter((todo) => !todo.completed).length;
}
