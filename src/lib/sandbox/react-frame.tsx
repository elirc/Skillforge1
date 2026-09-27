import * as React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { SandboxRequest, SandboxResult } from "./shared";

type Action = { type: "click" | "input" | "submit" | "wait"; selector?: string; value?: string; ms?: number };
type Assertion = { selector: string; text?: string; count?: number; value?: string; disabled?: boolean; attribute?: string; equals?: string };
type Fixture = { props?: Record<string, unknown>; actions?: Action[]; assertions: Assertion[] };
const container = document.getElementById("root")!;
let root = createRoot(container);
const pause = (ms = 0) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 500)));

window.addEventListener("message", async event => {
  if (event.source !== window.parent || event.data?.type !== "skillforge-react-run") return;
  const { request, token } = event.data as { request: SandboxRequest; token: string };
  const results: SandboxResult[] = [];
  try {
    const hookNames = ["useState", "useEffect", "useRef", "useMemo", "useCallback", "useReducer", "useId"] as const;
    const Component = new Function("React", ...hookNames, `${request.code}\nreturn ${request.functionName};`)(React, ...hookNames.map(name => React[name])) as React.ComponentType<Record<string, unknown>>;
    for (const test of request.tests) {
      try {
        const fixture = test.args[0] as Fixture;
        flushSync(() => root.unmount());
        root = createRoot(container);
        flushSync(() => root.render(React.createElement(Component, fixture.props ?? {})));
        await pause();
        for (const action of fixture.actions ?? []) {
          if (action.type === "wait") { await pause(action.ms ?? 30); continue; }
          const element = container.querySelector(action.selector ?? "") as HTMLElement | null;
          if (!element) throw new Error(`Could not find ${action.selector}`);
          if (action.type === "click") flushSync(() => element.click());
          if (action.type === "submit") flushSync(() => element.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
          if (action.type === "input") {
            const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, action.value ?? "");
            flushSync(() => { element.dispatchEvent(new Event("input", { bubbles: true })); element.dispatchEvent(new Event("change", { bubbles: true })); });
          }
          await pause();
        }
        const failures: string[] = [];
        for (const assertion of fixture.assertions) {
          const elements = container.querySelectorAll(assertion.selector);
          const element = elements[0];
          if (assertion.count !== undefined && elements.length !== assertion.count) failures.push(`${assertion.selector}: expected ${assertion.count} elements, received ${elements.length}`);
          if (!element && assertion.count !== 0) { failures.push(`Missing ${assertion.selector}`); continue; }
          if (!element) continue;
          if (assertion.text !== undefined && element.textContent?.trim() !== assertion.text) failures.push(`${assertion.selector}: expected text ${JSON.stringify(assertion.text)}, received ${JSON.stringify(element.textContent?.trim())}`);
          if (assertion.value !== undefined && (element as HTMLInputElement).value !== assertion.value) failures.push(`${assertion.selector}: expected value ${JSON.stringify(assertion.value)}`);
          if (assertion.disabled !== undefined && (element as HTMLButtonElement).disabled !== assertion.disabled) failures.push(`${assertion.selector}: disabled should be ${assertion.disabled}`);
          if (assertion.attribute && element.getAttribute(assertion.attribute) !== assertion.equals) failures.push(`${assertion.selector}: ${assertion.attribute} should be ${assertion.equals}`);
        }
        results.push({ name: test.name, hidden: test.hidden, expected: test.expected, actual: failures.length ? failures : true, passed: failures.length === 0, error: null });
      } catch (error) { results.push({ name: test.name, hidden: test.hidden, expected: test.expected, actual: null, passed: false, error: error instanceof Error ? error.message : String(error) }); }
    }
    window.parent.postMessage({ type: "skillforge-react-result", token, response: { results, passed: results.every(result => result.passed) } }, "*");
  } catch (error) { window.parent.postMessage({ type: "skillforge-react-result", token, error: error instanceof Error ? error.message : String(error) }, "*"); }
});
