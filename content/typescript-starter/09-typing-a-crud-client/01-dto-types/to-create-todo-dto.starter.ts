// What the form holds: HTML inputs always give you strings.
interface TodoForm {
  title: string;
  tags: string; // comma-separated, e.g. "work, Urgent"
  dueDate: string; // "" when the date picker is empty, else "YYYY-MM-DD"
  priority: string; // from a <select>: "1", "2", or "3"
}

// What the API expects in POST /todos: real types, no empty strings.
interface CreateTodoDto {
  title: string;
  tags: string[];
  dueDate: string | null;
  priority: 1 | 2 | 3;
}

// Convert the form into a CreateTodoDto (annotate the return type).
// Keep the key order title, tags, dueDate, priority.
export function toCreateTodoDto(form: TodoForm) {
  // title: trimmed.
  // tags: split on commas, trim, lowercase, drop empties, remove duplicates (keep first).
  // dueDate: trimmed; an empty string becomes null.
  // priority: 1, 2, or 3 when the trimmed string is one of those; anything else becomes 2.
}
