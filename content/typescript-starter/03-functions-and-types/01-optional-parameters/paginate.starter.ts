interface Page {
  page: number;
  totalPages: number;
  items: string[];
}

// page and pageSize are optional: callers may leave them out. Give them
// defaults (page = 1, pageSize = 3) either with `??` or with default
// parameter syntax such as `page: number = 1`. Annotate the return as Page.
export function paginate(items: string[], page?: number, pageSize?: number) {
  // 1. totalPages is Math.ceil(items.length / pageSize), but at least 1.
  // 2. Clamp page into 1..totalPages.
  // 3. Return { page, totalPages, items } with that page's slice.
}
