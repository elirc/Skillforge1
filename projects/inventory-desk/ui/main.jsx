import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

let csrf = "";
async function session() {
  const response = await fetch("/api/session");
  if (!response.ok) throw new Error("The server could not load your session.");
  const value = await response.json();
  csrf = value.csrfToken;
  return value;
}
async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrf,
      ...options.headers,
    },
  });
  const text = await response.text();
  let value;
  try {
    value = text ? JSON.parse(text) : null;
  } catch {
    value = null;
  }
  if (!response.ok) {
    const details = value?.errors
      ? Object.values(value.errors).flat().join(" ")
      : value?.detail;
    const error = new Error(
      [value?.title ?? `Request failed (${response.status})`, details]
        .filter(Boolean)
        .join(". "),
    );
    error.status = response.status;
    throw error;
  }
  return value;
}
function App() {
  const [email, setEmail] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    session()
      .then((value) => setEmail(value.email))
      .catch((error) => setError(error.message))
      .finally(() => setReady(true));
  }, []);
  return (
    <>
      <header>
        <div>
          <h1>Inventory Desk</h1>
          <p>Products, stock, and a clear history</p>
        </div>
        {email ? (
          <div className="actions">
            <span>{email}</span>
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await api("/api/logout", { method: "POST" });
                  await session();
                  setEmail(null);
                } catch (error) {
                  setError(error.message);
                }
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </header>
      <main>
        {error ? (
          <p role="alert" className="message error">
            {error}
          </p>
        ) : null}
        {!ready ? (
          <p role="status">Loading session…</p>
        ) : email ? (
          <Inventory key={email} />
        ) : (
          <Login onLogin={setEmail} />
        )}
      </main>
    </>
  );
}
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (register)
        await api("/api/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const current = await session();
      onLogin(current.email);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel auth">
      <h2>{register ? "Create a local account" : "Welcome back"}</h2>
      <p className="muted">
        Each account has its own products. This learning project keeps data in
        your local SQLite database.
      </p>
      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={12}
            maxLength={200}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={register ? "new-password" : "current-password"}
          />
        </label>
        <p className="muted">Use at least 12 characters.</p>
        {error ? (
          <p role="alert" className="message error">
            {error}
          </p>
        ) : null}
        <div className="actions">
          <button disabled={pending}>
            {pending ? "Working…" : register ? "Create account" : "Sign in"}
          </button>
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={() => {
              setRegister((value) => !value);
              setError("");
            }}
          >
            {register ? "I have an account" : "Create an account"}
          </button>
        </div>
      </form>
    </section>
  );
}
const blank = { sku: "", name: "", priceCents: 0, stock: 0 };
function Inventory() {
  const initial = new URLSearchParams(window.location.search);
  const [q, setQuery] = useState(initial.get("q") ?? "");
  const [sort, setSort] = useState(initial.get("sort") ?? "sku");
  const [page, setPage] = useState(
    Math.max(1, Number(initial.get("page")) || 1),
  );
  const [data, setData] = useState({ items: [], total: 0, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [audit, setAudit] = useState(null);
  const [retry, setRetry] = useState(null);
  const load = useCallback(() => {
    // Hide stale rows until their post-mutation versions arrive.
    setLoading(true);
    setReload((value) => value + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      q,
      sort,
      page: String(page),
      pageSize: "10",
    });
    window.history.replaceState(null, "", `/?${params}`);
    api(`/api/products?${params}`, { signal: controller.signal })
      .then((value) => {
        setData(value);
        setError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [q, sort, page, reload]);
  useEffect(() => {
    if (deleting) dialog.current?.showModal();
    else {
      dialog.current?.close();
      trigger.current?.focus();
    }
  }, [deleting]);
  async function save(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await api(editing ? `/api/products/${editing.id}` : "/api/products", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({ ...form, version: editing?.version }),
      });
      setForm(blank);
      setEditing(null);
      setNotice(editing ? "Product updated." : "Product created.");
      load();
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }
  async function adjust(product, delta, previous) {
    const request = previous ?? {
      delta,
      version: product.version,
      idempotencyKey: crypto.randomUUID(),
    };
    setPending(true);
    setError("");
    setRetry(null);
    try {
      await api(`/api/products/${product.id}/adjust`, {
        method: "POST",
        body: JSON.stringify(request),
      });
      setNotice("Stock adjusted.");
      load();
    } catch (error) {
      setError(error.message);
      if (!error.status || error.status >= 500) setRetry({ product, request });
    } finally {
      setPending(false);
    }
  }
  async function remove() {
    setPending(true);
    setError("");
    try {
      await api(`/api/products/${deleting.id}?version=${deleting.version}`, {
        method: "DELETE",
      });
      setDeleting(null);
      setNotice("Product deleted. Its audit history remains.");
      load();
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }
  function edit(product) {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      priceCents: product.priceCents,
      stock: product.stock,
    });
    document.getElementById("sku")?.focus();
  }
  return (
    <>
      {notice ? (
        <p role="status" className="message">
          {notice}
        </p>
      ) : null}
      {error ? (
        <div role="alert" className="message error">
          <p>{error}</p>
          <div className="actions">
            <button className="secondary" onClick={load}>
              Reload inventory
            </button>
            {retry ? (
              <button
                disabled={pending}
                onClick={() =>
                  adjust(retry.product, retry.request.delta, retry.request)
                }
              >
                Retry the same stock request
              </button>
            ) : null}
            {editing ? (
              <button
                className="secondary"
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Replace your unsaved edit with the latest product?",
                    )
                  )
                    return;
                  try {
                    edit(await api(`/api/products/${editing.id}`));
                  } catch (error) {
                    setError(error.message);
                  }
                }}
              >
                Reload latest product
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="layout">
        <section className="panel">
          <h2>Your inventory</h2>
          <div className="toolbar">
            <label>
              Search
              <input
                value={q}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                  setLoading(true);
                }}
                placeholder="Name or SKU"
              />
            </label>
            <label>
              Sort
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                  setLoading(true);
                }}
              >
                <option value="sku">SKU</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </label>
            <button className="secondary" onClick={load}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p role="status">Loading inventory…</p>
          ) : data.items.length === 0 ? (
            <p className="empty">
              {q
                ? "No products match this search."
                : "Your inventory is empty. Add your first product."}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <br />
                        <span className="muted">{product.sku}</span>
                      </td>
                      <td>${(product.priceCents / 100).toFixed(2)}</td>
                      <td className="stock">{product.stock}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="secondary"
                            disabled={pending}
                            aria-label={`Reserve one ${product.sku}`}
                            onClick={() => adjust(product, -1)}
                            {...(product.stock === 0 ? { disabled: true } : {})}
                          >
                            −1
                          </button>
                          <button
                            className="secondary"
                            disabled={pending}
                            aria-label={`Receive one ${product.sku}`}
                            onClick={() => adjust(product, 1)}
                          >
                            +1
                          </button>
                          <button
                            className="secondary"
                            disabled={pending}
                            onClick={() => edit(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="secondary"
                            disabled={pending}
                            onClick={(event) => {
                              trigger.current = event.currentTarget;
                              setDeleting(product);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <nav className="pagination" aria-label="Inventory pages">
            <button
              className="secondary"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>
            <span className="muted">
              Page {page} · {data.total} products
            </span>
            <button
              className="secondary"
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </nav>
          <details
            onToggle={async (event) => {
              if (event.currentTarget.open)
                try {
                  setAudit(await api("/api/audit"));
                } catch (error) {
                  setError(error.message);
                }
            }}
          >
            <summary>Recent audit history</summary>
            {audit ? (
              <ul className="muted">
                {audit.map((entry) => (
                  <li key={entry.id}>
                    {entry.action} · product {entry.productId}
                    {entry.delta
                      ? ` · ${entry.delta > 0 ? "+" : ""}${entry.delta}`
                      : ""}{" "}
                    · {new Date(entry.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Loading history…</p>
            )}
          </details>
        </section>
        <aside className="panel">
          <h2>{editing ? "Edit product" : "Add product"}</h2>
          <form onSubmit={save}>
            <label htmlFor="sku">
              SKU
              <input
                id="sku"
                required
                maxLength={40}
                value={form.sku}
                onChange={(event) =>
                  setForm((value) => ({ ...value, sku: event.target.value }))
                }
              />
            </label>
            <label htmlFor="product-name">
              Name
              <input
                id="product-name"
                required
                maxLength={120}
                value={form.name}
                onChange={(event) =>
                  setForm((value) => ({ ...value, name: event.target.value }))
                }
              />
            </label>
            <label htmlFor="price">
              Price in cents
              <input
                id="price"
                type="number"
                required
                min={0}
                max={2147483647}
                step={1}
                value={form.priceCents}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    priceCents: Number(event.target.value),
                  }))
                }
              />
            </label>
            {!editing ? (
              <label htmlFor="stock">
                Starting stock
                <input
                  id="stock"
                  type="number"
                  required
                  min={0}
                  max={2147483647}
                  step={1}
                  value={form.stock}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      stock: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ) : (
              <p className="muted">
                Editing version {editing.version}. Stock changes use the
                separate adjustment actions.
              </p>
            )}
            <div className="actions">
              <button disabled={pending}>
                {pending ? "Saving…" : editing ? "Save changes" : "Add product"}
              </button>
              {editing ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditing(null);
                    setForm(blank);
                  }}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </aside>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => setDeleting(null)}
        aria-labelledby="delete-title"
      >
        <h2 id="delete-title">Delete {deleting?.name}?</h2>
        <p>This removes the product while keeping its audit history.</p>
        <div className="actions">
          <button
            className="secondary"
            disabled={pending}
            onClick={() => setDeleting(null)}
          >
            Cancel
          </button>
          <button className="danger" disabled={pending} onClick={remove}>
            Confirm delete
          </button>
        </div>
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
