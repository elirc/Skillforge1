import type { SandboxRequest, SandboxResponse } from "./shared";

export async function runReactInFrame(request: SandboxRequest, container?: HTMLElement | null): Promise<SandboxResponse> {
  const compiledResponse = await fetch("/api/sandbox/react", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: request.code }) });
  const compiled = await compiledResponse.json();
  if (!compiledResponse.ok) throw new Error(compiled.error ?? "JSX compilation failed.");
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.title = "React component preview"; frame.sandbox.add("allow-scripts"); frame.src = "/react-lab.html";
    frame.className = "h-80 w-full rounded border bg-white";
    const token = crypto.randomUUID();
    const finish = () => { clearTimeout(timer); window.removeEventListener("message", listener); if (!container) frame.remove(); };
    const listener = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.data?.type !== "skillforge-react-result" || event.data.token !== token) return;
      finish(); if (event.data.error) reject(new Error(event.data.error)); else resolve(event.data.response);
    };
    const timer = setTimeout(() => { finish(); frame.remove(); reject(new Error("React exercise timed out. Check effects and render loops.")); }, 15_000);
    window.addEventListener("message", listener);
    frame.onload = () => frame.contentWindow?.postMessage({ type: "skillforge-react-run", token, request: { ...request, code: compiled.code } }, "*");
    if (container) { container.replaceChildren(frame); } else { frame.style.display = "none"; document.body.append(frame); }
  });
}
