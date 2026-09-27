type Command =
  | { type: "on" | "once" | "off"; event: string; listener: string }
  | { type: "emit"; event: string; payload: string };

type Listener = (payload: string) => void;

class Emitter {
  private listeners = new Map<string, Listener[]>();

  on(event: string, listener: Listener): () => void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
    return () => this.off(event, listener);
  }

  // TODO: remove the listener from the event's list.
  off(event: string, listener: Listener): void {}

  // TODO: a once listener must run only for the first matching emit.
  once(event: string, listener: Listener): () => void {
    return this.on(event, listener);
  }

  // TODO: iterate over a copy so listeners removed during emit do not break the loop.
  emit(event: string, payload: string): void {
    const list = this.listeners.get(event) ?? [];
    for (let i = 0; i < list.length; i += 1) list[i](payload);
  }
}

export function runEmitter(commands: Command[]): string[] {
  const emitter = new Emitter();
  const log: string[] = [];
  // Each listener name maps to one stable function, so off can find it again.
  const fns = new Map<string, Listener>();
  const fnFor = (name: string, event: string): Listener => {
    const key = name + "@" + event;
    if (!fns.has(key)) fns.set(key, (payload) => log.push(name + ":" + event + ":" + payload));
    return fns.get(key)!;
  };

  for (const command of commands) {
    if (command.type === "emit") emitter.emit(command.event, command.payload);
    else if (command.type === "on") emitter.on(command.event, fnFor(command.listener, command.event));
    else if (command.type === "once") emitter.once(command.event, fnFor(command.listener, command.event));
    else emitter.off(command.event, fnFor(command.listener, command.event));
  }
  return log;
}
