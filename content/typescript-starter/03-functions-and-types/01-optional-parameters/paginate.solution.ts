interface Page {
  page: number;
  totalPages: number;
  items: string[];
}

export function paginate(items: string[], page?: number, pageSize?: number): Page {
  const size = pageSize ?? 3;
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(page ?? 1, 1), totalPages);
  const start = (current - 1) * size;
  return { page: current, totalPages, items: items.slice(start, start + size) };
}
