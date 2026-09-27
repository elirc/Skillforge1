interface TodoForm {
  title: string;
  tags: string;
  dueDate: string;
  priority: string;
}

interface CreateTodoDto {
  title: string;
  tags: string[];
  dueDate: string | null;
  priority: 1 | 2 | 3;
}

function toPriority(value: string): CreateTodoDto["priority"] {
  const trimmed = value.trim();
  if (trimmed === "1") return 1;
  if (trimmed === "3") return 3;
  return 2;
}

export function toCreateTodoDto(form: TodoForm): CreateTodoDto {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== "");
  const dueDate = form.dueDate.trim();
  return {
    title: form.title.trim(),
    tags: [...new Set(tags)],
    dueDate: dueDate === "" ? null : dueDate,
    priority: toPriority(form.priority),
  };
}
