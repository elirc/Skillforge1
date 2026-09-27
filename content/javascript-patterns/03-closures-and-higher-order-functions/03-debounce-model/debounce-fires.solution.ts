export function debounceFires(times: number[], wait: number): number[] {
  const fires: number[] = [];
  times.forEach((time, index) => {
    const next = times[index + 1];
    // A later event before the timer runs out cancels this one.
    if (next === undefined || next >= time + wait) {
      fires.push(time + wait);
    }
  });
  return fires;
}
