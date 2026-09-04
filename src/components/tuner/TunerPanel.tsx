import { useCallback, useEffect, useRef, useState } from "react";
import { useTuner } from "@/hooks/useTuner";
import { midiToFrequency, nameToMidi } from "@/lib/audio/notes";

type Props = {
  title: string;
  strings: string[];
  subtitle?: string;
};

export function TunerPanel({ title, strings, subtitle }: Props) {
  const [locked, setLocked] = useState<string | null>(null);
  const { status, error, reading, start, stop } = useTuner(strings, { lockedNote: locked });
  const toneRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  const listening = status === "listening";
  const cents = reading ? Math.max(-50, Math.min(50, reading.cents)) : 0;
  const inTune = reading ? Math.abs(reading.cents) <= 5 : false;
  const color = !reading
    ? "var(--muted-foreground)"
    : inTune
      ? "var(--intune)"
      : reading.cents < 0
        ? "var(--flat)"
        : "var(--sharp)";

  const playReference = useCallback((note: string) => {
    toneRef.current?.osc.stop();
    toneRef.current = null;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = midiToFrequency(nameToMidi(note));
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.7);
    osc.onended = () => void ctx.close();
    toneRef.current = { ctx, osc, gain };
  }, []);

  useEffect(() => () => toneRef.current?.osc.stop(), []);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-10 sm:pt-14">
      <header className="text-center">
        <h1 className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {subtitle ?? `Standard tuning — ${strings.join(" · ")}`}
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border p-3 text-center text-xs"
          style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
        >
          {error}
        </p>
      )}

      <div className="soft-card mt-8 px-5 py-9 text-center sm:px-8">
        <p className="label-mono" aria-live="polite">
          {listening
            ? reading
              ? locked
                ? `Tuning ${locked}`
                : "Listening"
              : "Play a single string…"
            : status === "starting"
              ? "Starting microphone…"
              : "Microphone off"}
        </p>

        <p
          className="mt-3 font-display text-7xl leading-none tracking-[-0.04em] transition-colors sm:text-8xl"
          style={{ color }}
        >
          {reading ? reading.targetNote.replace(/\d/g, "") : "—"}
          <span className="align-super text-2xl text-muted-foreground sm:text-3xl">
            {reading ? reading.targetNote.replace(/\D/g, "") : ""}
          </span>
        </p>

        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {reading ? `${reading.frequency.toFixed(1)} Hz` : "— Hz"}
        </p>

        {/* Cents meter */}
        <div className="relative mx-auto mt-8 h-14 w-full max-w-md">
          <div className="absolute inset-x-0 top-1/2 h-px bg-panel-edge" />
          {[-50, -25, 0, 25, 50].map((tick) => (
            <div
              key={tick}
              className="absolute top-1/2 w-px -translate-x-1/2"
              style={{
                left: `${50 + tick}%`,
                height: tick === 0 ? "100%" : "44%",
                transform: "translate(-50%, -50%)",
                backgroundColor: tick === 0 ? "var(--intune)" : "var(--panel-edge)",
              }}
            />
          ))}
          <div
            className="absolute top-1/2 h-11 w-1.5 rounded-full"
            style={{
              left: `${50 + cents}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: color,
              opacity: reading ? 1 : 0.25,
              transition: "left 120ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease",
            }}
            aria-hidden
          />
        </div>

        <div className="mx-auto mt-3 flex max-w-md items-center justify-between">
          <span className="label-mono">Flat</span>
          <span className="label-mono" style={{ color }} aria-live="polite">
            {reading
              ? inTune
                ? "In tune"
                : `${reading.cents > 0 ? "+" : ""}${reading.cents.toFixed(0)} cents`
              : "No signal"}
          </span>
          <span className="label-mono">Sharp</span>
        </div>

        <button
          type="button"
          onClick={() => (listening ? stop() : void start())}
          className="mt-8 rounded-full px-8 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          style={
            listening
              ? { border: "1px solid var(--panel-edge)" }
              : { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
          }
        >
          {listening ? "Stop microphone" : "Start tuning"}
        </button>
      </div>

      {/* String selector */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="label-mono">Strings</h2>
          <button
            type="button"
            onClick={() => setLocked(null)}
            className="label-mono transition-colors hover:text-foreground"
            style={locked ? undefined : { color: "var(--signal)" }}
          >
            Auto detect
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {strings.map((note) => {
            const active = reading?.targetNote === note && listening;
            const isLocked = locked === note;
            return (
              <div key={note} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setLocked(isLocked ? null : note)}
                  aria-pressed={isLocked}
                  className="rounded-xl border px-3 py-3 font-mono text-sm transition-colors"
                  style={{
                    borderColor: isLocked
                      ? "var(--signal)"
                      : active
                        ? color
                        : "var(--panel-edge)",
                    color: active ? color : isLocked ? "var(--signal)" : "var(--foreground)",
                    backgroundColor: "color-mix(in oklch, var(--panel) 85%, transparent)",
                  }}
                >
                  {note}
                </button>
                <button
                  type="button"
                  onClick={() => playReference(note)}
                  className="label-mono transition-colors hover:text-foreground"
                >
                  Play
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Play one string at a time, close to the mic. Tap a string to lock the tuner to it.
        Microphone access needs a secure connection and your permission.
      </p>
    </div>
  );
}
