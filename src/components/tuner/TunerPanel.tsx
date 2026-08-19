import { useTuner } from "@/hooks/useTuner";
import { controlButtonClass } from "@/components/instrument/ControlBar";

type Props = {
  title: string;
  strings: string[];
};

export function TunerPanel({ title, strings }: Props) {
  const { status, error, reading, start, stop } = useTuner(strings);
  const cents = reading ? Math.max(-50, Math.min(50, reading.cents)) : 0;
  const inTune = reading ? Math.abs(reading.cents) < 5 : false;
  const color = !reading
    ? "var(--muted-foreground)"
    : inTune
      ? "var(--intune)"
      : reading.cents < 0
        ? "var(--flat)"
        : "var(--sharp)";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <header className="hairline flex flex-wrap items-end justify-between gap-4 pb-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">{title}</h1>
          <p className="label-mono mt-1">Target strings — {strings.join(" · ")}</p>
        </div>
        <button
          type="button"
          className={controlButtonClass}
          onClick={() => (status === "listening" ? stop() : void start())}
        >
          {status === "listening" ? "Stop mic" : "Start mic"}
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-4 border p-3 font-mono text-xs"
          style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
        >
          {error}
        </p>
      )}

      <div className="panel mt-6 p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-7xl leading-none" style={{ color }}>
            {reading ? reading.targetNote : "—"}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {reading ? `${reading.frequency.toFixed(1)} Hz` : status === "listening" ? "Listening…" : "Idle"}
          </span>
        </div>

        <div className="relative mt-8 h-16 border border-panel-edge">
          <div className="absolute inset-y-0 left-1/2 w-px" style={{ backgroundColor: "var(--intune)" }} />
          {[-40, -20, 20, 40].map((tick) => (
            <div
              key={tick}
              className="absolute inset-y-3 w-px bg-panel-edge"
              style={{ left: `${50 + tick}%` }}
            />
          ))}
          <div
            className="absolute inset-y-0 w-1 transition-[left] duration-75"
            style={{ left: `calc(${50 + cents}% - 2px)`, backgroundColor: color }}
            aria-hidden
          />
        </div>

        <div className="mt-3 flex justify-between">
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
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {strings.map((note) => (
          <div
            key={note}
            className="panel px-4 py-3 font-mono text-sm"
            style={
              reading?.targetNote === note
                ? { borderColor: color, color }
                : { color: "var(--muted-foreground)" }
            }
          >
            {note}
          </div>
        ))}
      </div>

      <p className="label-mono mt-6 leading-relaxed">
        Play one string at a time. Microphone access requires a secure (HTTPS) connection and your
        explicit permission.
      </p>
    </div>
  );
}
