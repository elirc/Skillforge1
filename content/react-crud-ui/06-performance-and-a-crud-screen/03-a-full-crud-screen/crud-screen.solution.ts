interface Item {
  id: number;
  title: string;
}

type Mode = "list" | "detail" | "edit" | "create" | "confirm-delete";

type ScreenEvent =
  | { type: "select"; id: number }
  | { type: "new" }
  | { type: "edit" }
  | { type: "change"; title: string }
  | { type: "save" }
  | { type: "cancel" }
  | { type: "delete" }
  | { type: "confirm" }
  | { type: "back" };

interface Screen {
  mode: Mode;
  selectedId: number | null;
  draft: { title: string } | null;
  notice: string | null;
  items: Item[];
}

function reduce(state: Screen, event: ScreenEvent): Screen {
  const { mode } = state;
  switch (event.type) {
    case "select":
      if (mode !== "list" && mode !== "detail") return state;
      if (!state.items.some((item) => item.id === event.id)) return state;
      return { ...state, mode: "detail", selectedId: event.id, notice: null };
    case "new":
      if (mode !== "list" && mode !== "detail") return state;
      return { ...state, mode: "create", selectedId: null, draft: { title: "" }, notice: null };
    case "edit": {
      if (mode !== "detail") return state;
      const item = state.items.find((i) => i.id === state.selectedId);
      return item ? { ...state, mode: "edit", draft: { title: item.title }, notice: null } : state;
    }
    case "change":
      if (mode !== "edit" && mode !== "create") return state;
      return { ...state, draft: { title: event.title } };
    case "save": {
      if ((mode !== "edit" && mode !== "create") || state.draft === null) return state;
      const title = state.draft.title.trim();
      if (title === "") return { ...state, notice: "Title is required" };
      if (mode === "edit") {
        const items = state.items.map((i) => (i.id === state.selectedId ? { ...i, title } : i));
        return { ...state, mode: "detail", draft: null, notice: "Saved", items };
      }
      const id = Math.max(0, ...state.items.map((i) => i.id)) + 1;
      return { ...state, mode: "detail", selectedId: id, draft: null, notice: "Created", items: [...state.items, { id, title }] };
    }
    case "cancel":
      if (mode === "edit") return { ...state, mode: "detail", draft: null, notice: null };
      if (mode === "create") return { ...state, mode: "list", draft: null, notice: null };
      if (mode === "confirm-delete") return { ...state, mode: "detail" };
      return state;
    case "delete":
      return mode === "detail" ? { ...state, mode: "confirm-delete", notice: null } : state;
    case "confirm":
      if (mode !== "confirm-delete") return state;
      return {
        ...state,
        mode: "list",
        selectedId: null,
        notice: "Deleted",
        items: state.items.filter((i) => i.id !== state.selectedId),
      };
    case "back":
      return mode === "detail" ? { ...state, mode: "list", selectedId: null, notice: null } : state;
  }
}

export function crudScreen(items: Item[], events: ScreenEvent[]): Screen {
  let state: Screen = { mode: "list", selectedId: null, draft: null, notice: null, items };
  for (const event of events) state = reduce(state, event);
  return state;
}
