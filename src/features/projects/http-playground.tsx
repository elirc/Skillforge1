"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const scenarios = [
  {
    title: "Read the list",
    method: "GET",
    query: "",
    headers: {},
    body: "",
    predict:
      "200 with a JSON array. A successful read does not create a record.",
  },
  {
    title: "Read one product and its ETag",
    method: "GET",
    query: "?id=1",
    headers: {},
    body: "",
    predict: '200 with ETag "2", which identifies this fixture version.',
  },
  {
    title: "Read a missing product",
    method: "GET",
    query: "?id=99",
    headers: {},
    body: "",
    predict:
      "404 with Problem Details. Missing data is different from an empty collection.",
  },
  {
    title: "Create a valid product",
    method: "POST",
    query: "",
    headers: {},
    body: '{"name":"Pencil","stock":5}',
    predict:
      "201 with a Location header. This fixture returns a creation response without storing data; a later GET for ID 3 still returns 404.",
  },
  {
    title: "Submit invalid data",
    method: "POST",
    query: "",
    headers: {},
    body: '{"name":"","stock":-1}',
    predict:
      "400 with a useful validation message. JSON syntax can be valid while business values are invalid.",
  },
  {
    title: "Try without permission",
    method: "PATCH",
    query: "?id=1",
    headers: { "If-Match": '"2"' },
    body: "{}",
    predict:
      "403. The server must check permission independently of visible UI controls.",
  },
  {
    title: "Try a stale version",
    method: "PATCH",
    query: "?id=1",
    headers: { "X-Demo-Role": "editor", "If-Match": '"1"' },
    body: "{}",
    predict:
      "412 because the supplied precondition does not match the current version. Read the latest state before retrying.",
  },
  {
    title: "Use the current version",
    method: "PATCH",
    query: "?id=1",
    headers: { "X-Demo-Role": "editor", "If-Match": '"2"' },
    body: "{}",
    predict:
      '200 with ETag "3". The fixture resets for the next request; the companion API persists actual changes.',
  },
];
export function HttpPlayground() {
  const [index, setIndex] = useState(0);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<{
    status: string;
    headers: string;
    body: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const scenario = scenarios[index];
  const path = `/api/playground/products${scenario.query}`;
  async function send() {
    setPending(true);
    setError(null);
    try {
      const result = await fetch(path, {
        method: scenario.method,
        headers: {
          "Content-Type": "application/json",
          ...scenario.headers,
        } as Record<string, string>,
        ...(scenario.method !== "GET" ? { body } : {}),
      });
      const text = await result.text();
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {}
      setResponse({
        status: `${result.status} ${result.statusText}`,
        headers: [...result.headers]
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n"),
        body: formatted,
      });
    } catch {
      setError(
        "The request failed. Check that the local app is running and retry.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-5">
      <label className="block">
        Scenario
        <select
          className="mt-2 block w-full rounded border bg-transparent p-3"
          value={index}
          onChange={(event) => {
            const next = Number(event.target.value);
            setIndex(next);
            setBody(scenarios[next].body);
            setResponse(null);
          }}
        >
          {scenarios.map((item, i) => (
            <option key={item.title} value={i}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <div className="rounded border p-4">
        <p className="font-mono">
          {scenario.method} {path}
        </p>
        <pre className="mt-2 overflow-auto text-sm">
          {JSON.stringify(scenario.headers, null, 2)}
        </pre>
        {scenario.method !== "GET" ? (
          <label className="mt-3 block">
            JSON request body
            <textarea
              className="mt-2 block min-h-28 w-full rounded border bg-transparent p-3 font-mono text-sm"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
        ) : null}
      </div>
      <p>
        Predict the status and response before sending. Edit the JSON body to
        test a boundary.
      </p>
      <Button onClick={send} disabled={pending}>
        {pending ? "Sending…" : "Send local request"}
      </Button>
      {error ? <p role="alert">{error}</p> : null}
      {response ? (
        <section className="space-y-3 rounded border p-4" aria-live="polite">
          <h2 className="text-xl font-semibold">Response: {response.status}</h2>
          <pre className="overflow-auto whitespace-pre-wrap text-sm">
            {response.headers}
          </pre>
          <pre className="overflow-auto text-sm">{response.body}</pre>
          <p>{scenario.predict}</p>
        </section>
      ) : null}
    </div>
  );
}
