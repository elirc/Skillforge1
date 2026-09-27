interface Settings {
  theme?: "light" | "dark" | "system";
  pageSize?: number;
  emailDigest?: "off" | "daily" | "weekly";
  locale?: string;
}

const DEFAULTS: Required<Settings> = {
  theme: "system",
  pageSize: 20,
  emailDigest: "weekly",
  locale: "en-US",
};

export function resolveSettings(saved: Partial<Settings>): Readonly<Required<Settings>> {
  const pageSize = Math.min(100, Math.max(5, Math.floor(saved.pageSize ?? DEFAULTS.pageSize)));
  const locale = saved.locale?.trim() || DEFAULTS.locale;
  return {
    theme: saved.theme ?? DEFAULTS.theme,
    pageSize,
    emailDigest: saved.emailDigest ?? DEFAULTS.emailDigest,
    locale,
  };
}
