interface RenderedRow {
  id: number;
  label: string;
  draft: string; // the row component's local useState value (an unsaved note)
}

interface Item {
  id: number;
  label: string;
}

// Each row is rendered as <Row key={...} item={item} /> and Row keeps a local
// `draft` in useState(""). React matches old and new rows BY KEY:
// - a key that existed before keeps its component and therefore its draft
// - a new key mounts a fresh Row with draft ""
// - an old key that is gone unmounts (its draft is lost)
// keyMode "index" uses key={index}; keyMode "id" uses key={item.id}. Keys are strings.
//
// Return { rows: [{ key, label, draft }] in next order, unmountedKeys: [...] in
// previous order }. The label always comes from the new item (props update);
// the draft comes from whichever instance the key matched.
export function simulateKeyedState(prevRows: RenderedRow[], nextItems: Item[], keyMode: "index" | "id") {
  return {
    rows: nextItems.map((item, index) => ({ key: String(index), label: item.label, draft: "" })),
    unmountedKeys: [],
  };
}
