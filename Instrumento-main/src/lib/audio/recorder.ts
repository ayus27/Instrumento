import { getEngine } from "./engine";

export type PerfEvent = {
  t: number;
  instrument: string;
  action: "attack" | "release" | "hit";
  target: string;
  velocity: number;
};

export type RecorderState = "idle" | "recording" | "stopped";

export type SavedRecording = {
  id: string;
  name: string;
  instrument: string;
  bpm: number;
  duration: number;
  events: PerfEvent[];
  createdAt: string;
};

const STORAGE_KEY = "instrumento.recordings";

class PerformanceRecorder {
  state: RecorderState = "idle";
  events: PerfEvent[] = [];
  duration = 0;
  audioUrl: string | null = null;
  instrument = "";
  private startedAt = 0;
  private listeners = new Set<() => void>();
  private snapshot = 0;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = () => this.snapshot;

  private emit() {
    this.snapshot += 1;
    this.listeners.forEach((fn) => fn());
  }

  async start(instrument: string) {
    this.events = [];
    this.duration = 0;
    this.instrument = instrument;
    this.audioUrl = null;
    this.startedAt = performance.now();
    this.state = "recording";
    this.emit();
    try {
      await getEngine().startAudioRecording();
    } catch {
      /* audio-file capture unsupported: event recording still works */
    }
  }

  capture(event: Omit<PerfEvent, "t">) {
    if (this.state !== "recording") return;
    this.events.push({ ...event, t: performance.now() - this.startedAt });
  }

  async stop() {
    if (this.state !== "recording") return;
    this.duration = performance.now() - this.startedAt;
    this.state = "stopped";
    this.emit();
    try {
      this.audioUrl = await getEngine().stopAudioRecording();
    } catch {
      this.audioUrl = null;
    }
    this.emit();
  }

  reset() {
    this.state = "idle";
    this.events = [];
    this.duration = 0;
    this.audioUrl = null;
    this.emit();
  }

  elapsed() {
    return this.state === "recording" ? performance.now() - this.startedAt : this.duration;
  }
}

let recorder: PerformanceRecorder | null = null;

export function getRecorder(): PerformanceRecorder {
  if (!recorder) recorder = new PerformanceRecorder();
  return recorder;
}

export function playEvents(
  events: PerfEvent[],
  handlers: {
    attack: (target: string, velocity: number) => void;
    release: (target: string) => void;
    hit: (target: string, velocity: number) => void;
  },
  onDone?: () => void,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const last = events.length ? Math.max(...events.map((e) => e.t)) : 0;
  events.forEach((event) => {
    timers.push(
      setTimeout(() => {
        if (event.action === "attack") handlers.attack(event.target, event.velocity);
        else if (event.action === "release") handlers.release(event.target);
        else handlers.hit(event.target, event.velocity);
      }, event.t),
    );
  });
  timers.push(setTimeout(() => onDone?.(), last + 400));
  return () => timers.forEach(clearTimeout);
}

export function loadRecordings(): SavedRecording[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedRecording[]) : [];
  } catch {
    return [];
  }
}

export function saveRecording(entry: SavedRecording) {
  if (typeof window === "undefined") return;
  const all = [entry, ...loadRecordings()].slice(0, 50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteRecording(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(loadRecordings().filter((r) => r.id !== id)),
  );
}
