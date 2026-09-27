type Command =
  | { type: "on" | "once" | "off"; event: string; listener: string }
  | { type: "emit"; event: string; payload: string };

type Listener = (payload: string) => void;

class Emitter {
  private listeners = new Map<string, Listener[]>();

  on(event: string, listener: Listener): () => void {
    const list = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...list, listener]);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener): void {
    const list = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      list.filter((entry) => entry !== listener),
    );
  }

  once(event: string, listener: Listener): () => void {
    const wrapper: Listener = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  emit(event: string, payload: string): void {
    const snapshot = [...(this.listeners.get(event) ?? [])];
    for (const listener of snapshot) listener(payload);
  }
}

export function runEmitter(commands: Command[]): string[] {
  const emitter = new Emitter();
  const log: string[] = [];
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
