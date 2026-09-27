export function utcDay(timestamp: string): string { return new Date(timestamp).toISOString().slice(0,10); }
export function regressionCases() { return [{"args":["2026-01-01T23:30:00-02:00"],"expected":"2026-01-02"},{"args":["2026-01-01T10:00:00Z"],"expected":"2026-01-01"},{"args":["2026-01-01T00:30:00+02:00"],"expected":"2025-12-31"}]; }
