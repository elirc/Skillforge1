type Tab = { label: string; hidden?: boolean };

export function visibleTabs(tabs: Tab[]): string[] {
  return tabs.filter((tab) => !tab.hidden).map((tab) => tab.label);
}
