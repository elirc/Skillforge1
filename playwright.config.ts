import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // The single e2e spec walks four routes (/tracks, a course, a lesson,
  // /reviews) and on a cold dev server each one is a first-time Turbopack
  // compile that can take tens of seconds on this machine. 30s covered none
  // of that; 240s leaves headroom for the worst observed cold walk without
  // hiding a genuine hang (which would still fail, just later).
  timeout: 240_000,
  // Assertions wait for a route compile too, so give them a matching slice.
  expect: { timeout: 30_000 },
  use: {
    // Must be `localhost`, not 127.0.0.1. Next 16's dev server only accepts
    // /_next/* requests whose Origin is in `allowedDevOrigins` (default:
    // localhost). Page and chunk loads carry no Origin so they still work from
    // 127.0.0.1, but the HMR WebSocket handshake always does and gets dropped
    // with no HTTP response; the dev client then full-reloads the page every
    // ~55s, hydration never completes, and no click handler ever attaches.
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    // Readiness probe only (never used by the browser), so the IPv4 literal
    // is fine here and sidesteps any localhost -> ::1 resolution quirks.
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    // A cold Turbopack start plus first-request compile runs well past two
    // minutes on a slow machine; this is startup budget, not test budget.
    timeout: 300_000,
  },
  projects: [
    {
      name: "chromium",
      // `channel: "chromium"` runs the full Chromium build rather than the
      // separate chrome-headless-shell download, so `playwright install
      // chromium` alone is enough to run this suite.
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
});
