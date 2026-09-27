type CounterEvent = { type: "tick" } | { type: "click"; add: number };

interface Setup {
  deps: "empty" | "count"; // useEffect(..., [])  or  useEffect(..., [count])
  update: "snapshot" | "updater"; // setCount(count + 1)  or  setCount(c => c + 1)
}

// The component:
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     const id = setInterval(() => /* snapshot: */ setCount(count + 1) /* or updater */, 1000);
//     return () => clearInterval(id);
//   }, deps);
//   <button onClick={() => setCount(c => c + add)}>
//
// The interval callback sees the `count` from the render whose effect created it.
// Replay the events (tick = the interval fires, click = the button) and return
// { count, intervalsCreated, intervalsCleared }. Rules:
// - the effect runs on mount: intervalsCreated starts at 1
// - a setCount that produces the current value causes no re-render
// - with deps "count", each change of count re-runs the effect: clear the old
//   interval, create a new one that captures the new count
// - with deps "empty", the interval is created once and keeps its first closure
export function simulateCounter(events: CounterEvent[], setup: Setup) {
  let count = 0;
  for (const event of events) {
    count = event.type === "tick" ? count + 1 : count + event.add;
  }
  return { count, intervalsCreated: 1, intervalsCleared: 0 };
}
