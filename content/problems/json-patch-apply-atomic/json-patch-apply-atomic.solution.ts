export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type PatchOp =
  | { op: "add" | "replace" | "test"; path: string; value: Json }
  | { op: "remove"; path: string }
  | { op: "move" | "copy"; from: string; path: string };

type Container = Json[] | { [key: string]: Json };

export function applyPatch(doc: Json, ops: PatchOp[]): Json | null {
  const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key);
  const isIndex = (token: string) => /^(0|[1-9]\d*)$/.test(token);
  const clone = (value: Json): Json => JSON.parse(JSON.stringify(value));
  const isContainer = (value: unknown): value is Container => value !== null && typeof value === "object";

  // Wrapping the document means the empty pointer is just the "root" key.
  const holder: { [key: string]: Json } = { root: clone(doc) };

  function parse(pointer: string): string[] | null {
    if (pointer === "") return ["root"];
    if (!pointer.startsWith("/")) return null;
    return ["root", ...pointer.slice(1).split("/").map((t) => t.replace(/~1/g, "/").replace(/~0/g, "~"))];
  }

  function child(node: Json, token: string): Json | undefined {
    if (Array.isArray(node)) return isIndex(token) && Number(token) < node.length ? node[Number(token)] : undefined;
    if (isContainer(node)) return hasOwn(node, token) ? node[token] : undefined;
    return undefined;
  }

  function parentOf(tokens: string[]): { parent: Container; key: string } | null {
    let node: Json = holder;
    for (const token of tokens.slice(0, -1)) {
      const next = child(node, token);
      if (next === undefined) return null;
      node = next;
    }
    return isContainer(node) ? { parent: node, key: tokens[tokens.length - 1] } : null;
  }

  function get(tokens: string[]): Json | undefined {
    const found = parentOf(tokens);
    return found ? child(found.parent, found.key) : undefined;
  }

  function add(tokens: string[], value: Json): boolean {
    const found = parentOf(tokens);
    if (!found) return false;
    const { parent, key } = found;
    if (Array.isArray(parent)) {
      if (key === "-") parent.push(value);
      else if (isIndex(key) && Number(key) <= parent.length) parent.splice(Number(key), 0, value);
      else return false;
      return true;
    }
    parent[key] = value;
    return true;
  }

  function remove(tokens: string[]): boolean {
    if (tokens.length === 1) return false; // removing the whole document
    const found = parentOf(tokens);
    if (!found || child(found.parent, found.key) === undefined) return false;
    const { parent, key } = found;
    if (Array.isArray(parent)) parent.splice(Number(key), 1);
    else delete parent[key];
    return true;
  }

  function deepEqual(a: Json, b: Json): boolean {
    if (a === b) return true;
    if (Array.isArray(a) || Array.isArray(b)) {
      return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
    }
    if (isContainer(a) && isContainer(b)) {
      const objA = a as { [key: string]: Json };
      const objB = b as { [key: string]: Json };
      const keys = Object.keys(objA);
      return keys.length === Object.keys(objB).length && keys.every((k) => hasOwn(objB, k) && deepEqual(objA[k], objB[k]));
    }
    return false;
  }

  for (const op of ops) {
    const path = parse(op.path);
    if (!path) return null;

    let ok = false;
    if (op.op === "add") {
      ok = add(path, clone(op.value));
    } else if (op.op === "remove") {
      ok = remove(path);
    } else if (op.op === "replace") {
      const found = parentOf(path);
      if (found && child(found.parent, found.key) !== undefined) {
        if (Array.isArray(found.parent)) found.parent[Number(found.key)] = clone(op.value);
        else found.parent[found.key] = clone(op.value);
        ok = true;
      }
    } else if (op.op === "test") {
      const current = get(path);
      ok = current !== undefined && deepEqual(current, op.value);
    } else if (op.op === "move" || op.op === "copy") {
      const from = parse(op.from);
      if (!from) return null;
      if (op.op === "move" && op.path.startsWith(op.from + "/")) return null;
      const value = get(from);
      if (value === undefined) return null;
      ok = op.op === "move" ? remove(from) && add(path, value) : add(path, clone(value));
    }
    if (!ok) return null;
  }

  return holder.root;
}
