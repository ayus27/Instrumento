import { useEffect, useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { PitchIndicator } from "./PitchIndicator";
import { useDrumTuner } from "@/hooks/useDrumTuner";
import { DRUM_TUNER_PRESETS, getPreset } from "@/lib/tuner/tunerPresets";

export function DrumTuner() {
  const [presetId, setPresetId] = useState(DRUM_TUNER_PRESETS[0].id);
  const [target, setTarget] = useState(DRUM_TUNER_PRESETS[0].frequency);
  const { status, error, reading, start, stop } = useDrumTuner(target);

  useEffect(() => {
    setTarget(getPreset(presetId).frequency);
  }, [presetId]);

  const listening = status === "listening";
  const fresh = reading && performance.now() - reading.at < 1500;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-5 py-8">
      <header className="hairline flex flex-wrap items-end justify-between gap-4 pb-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Drum Tuner</h1>
          <p className="label-mono mt-1">Microphone pitch analysis for drum heads</p>
        </div>
        <button
          type="button"
          className={controlButtonClass}
          onClick={() => (listening ? stop() : void start())}
        >
          {listening ? "Stop microphone" : "Enable microphone"}
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="border p-3 font-mono text-xs"
          style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="panel space-y-2 p-4">
          <span className="label-mono">Drum</span>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="w-full bg-background px-3 py-2 font-mono text-xs text-foreground"
            style={{ border: "1px solid var(--panel-edge)" }}
          >
            {DRUM_TUNER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="panel space-y-2 p-4">
          <span className="label-mono">Target frequency (Hz)</span>
          <input
            type="number"
            min={30}
            max={800}
            step={1}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
            className="w-full bg-background px-3 py-2 font-mono text-xs text-foreground"
            style={{ border: "1px solid var(--panel-edge)" }}
          />
          <span className="font-mono text-[11px] text-muted-foreground">
            A starting point only — shell, heads, size and room all change the ideal pitch.
          </span>
        </label>
      </div>

      <div className="panel space-y-4 p-6">
        <p className="label-mono" aria-live="polite">
          {status === "listening"
            ? "Microphone active"
            : status === "starting"
              ? "Starting microphone…"
              : status === "denied"
                ? "Microphone blocked"
                : status === "unsupported"
                  ? "Not supported in this browser"
                  : "Microphone off"}
        </p>

        {listening && !fresh ? (
          <p className="font-mono text-sm text-muted-foreground">Waiting for a drum hit…</p>
        ) : (
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <p className="label-mono">Detected</p>
              <p className="font-display text-5xl tracking-tight">{fresh ? reading.note : "—"}</p>
            </div>
            <div>
              <p className="label-mono">Frequency</p>
              <p className="font-mono text-2xl text-signal">
                {fresh ? `${reading.frequency.toFixed(1)} Hz` : "—"}
              </p>
            </div>
            <div>
              <p className="label-mono">Target</p>
              <p className="font-mono text-2xl">{target ? `${target} Hz` : "—"}</p>
            </div>
          </div>
        )}

        <PitchIndicator cents={fresh ? reading.cents : 0} active={Boolean(fresh)} />
      </div>
    </div>
  );
}
