interface Settings {
  theme?: "light" | "dark" | "system";
  pageSize?: number;
  emailDigest?: "off" | "daily" | "weekly";
  locale?: string;
}

// Required<Settings> removes every ?, so DEFAULTS must provide all four keys.
const DEFAULTS: Required<Settings> = {
  theme: "system",
  pageSize: 20,
  emailDigest: "weekly",
  locale: "en-US",
};

// Return a Readonly<Required<Settings>>: every key present, none reassignable.
// Build the result with keys in the order theme, pageSize, emailDigest, locale.
export function resolveSettings(saved: Partial<Settings>) {
  // 1. Use the saved value when it is present (not undefined and not null),
  //    otherwise the default.
  // 2. pageSize: round down, then clamp to 5..100.
  // 3. locale: trim; an empty string falls back to the default.
}
