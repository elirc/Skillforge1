import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { compileReact } from "../../src/lib/sandbox/react-compiler";
import type { SandboxRequest, SandboxResponse } from "../../src/lib/sandbox/shared";

/** Executes the same mounted-component harness in Chromium for authoritative grading. */
export async function runReactInNode(request: SandboxRequest): Promise<SandboxResponse> {
  const code = compileReact(request.code);
  const script = await readFile("public/runtimes/react-frame.js", "utf8");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route("**/*", route => route.abort());
    await page.setContent('<!doctype html><html><body><div id="root"></div></body></html>');
    await page.addScriptTag({ content: script });
    // Keep the browser callback as source: tsx's keepNames transform otherwise
    // introduces a Node-side __name helper into serialized nested functions.
    const execution = page.evaluate<SandboxResponse>(`(request => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("React execution timed out.")), 10_000);
      const token = "validation";
      const listener = (event) => {
        if (event.source !== window || event.data?.type !== "skillforge-react-result" || event.data.token !== token) return;
        clearTimeout(timer); window.removeEventListener("message", listener);
        if (event.data.error) reject(new Error(event.data.error)); else resolve(event.data.response);
      };
      window.addEventListener("message", listener);
      window.postMessage({ type: "skillforge-react-run", token, request }, "*");
    }))(${JSON.stringify({ ...request, code })})`);
    let timeout: NodeJS.Timeout | undefined;
    try { return await Promise.race([execution, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("React execution timed out.")), 15_000); })]); }
    finally { clearTimeout(timeout); }
  } finally { await browser.close(); }
}
