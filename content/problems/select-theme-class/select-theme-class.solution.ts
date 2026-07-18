type Theme = "light" | "dark" | undefined;

export function selectThemeClass(theme: Theme): string {
  if (theme === "dark") return "theme-dark";
  if (theme === "light") return "theme-light";
  return "theme-system";
}
