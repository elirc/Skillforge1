type InputEvent = { t: number; value: string };

export function debounceTimeline(events: InputEvent[], wait: number, maxWait: number | null) {
  // Track one pending burst (latest value, first time, last time). Before
  // handling each event, fire the burst if its deadline has already passed.
}
