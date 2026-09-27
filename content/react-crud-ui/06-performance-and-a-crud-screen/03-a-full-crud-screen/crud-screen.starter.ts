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

// The reducer behind a list + detail + edit + delete-confirm screen
// (useReducer(reduce, initial)). Start: { mode: "list", selectedId: null,
// draft: null, notice: null, items }. Any event not allowed in the current
// mode is ignored (state unchanged). Build every new state with spreads so the
// keys stay in the order mode, selectedId, draft, notice, items.
// - select id: in list/detail, if the item exists -> detail, selectedId = id, notice null
// - new:       in list/detail -> create, selectedId null, draft { title: "" }, notice null
// - edit:      in detail -> edit, draft { title: <selected item title> }, notice null
// - change:    in edit/create -> draft { title }
// - save:      in edit/create. Trimmed title "" -> notice "Title is required" (stay).
//              edit: rename the item (trimmed) -> detail, draft null, notice "Saved"
//              create: add { id: max id + 1 (1 if empty), title } at the end ->
//                      detail, selectedId = new id, draft null, notice "Created"
// - cancel:    edit -> detail (draft null, notice null); create -> list (draft null,
//              notice null); confirm-delete -> detail
// - delete:    in detail -> confirm-delete, notice null
// - confirm:   in confirm-delete -> remove the item -> list, selectedId null, notice "Deleted"
// - back:      in detail -> list, selectedId null, notice null
export function crudScreen(items: Item[], events: ScreenEvent[]) {
  let state: Screen = { mode: "list", selectedId: null, draft: null, notice: null, items };
  for (const event of events) {
    if (event.type === "select") state = { ...state, mode: "detail", selectedId: event.id };
    if (event.type === "back") state = { ...state, mode: "list", selectedId: null };
  }
  return state;
}
