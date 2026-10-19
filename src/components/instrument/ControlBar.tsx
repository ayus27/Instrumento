import type { ReactNode } from "react";
import { toast } from "sonner";
import type { useMetronome } from "@/hooks/useMetronome";
import type { useRecorder } from "@/hooks/useRecorder";

type Props = {
  metronome: ReturnType<typeof useMetronome>;
  recorder: ReturnType<typeof useRecorder>;
  volume: number;
  onVolume: (value: number) => void;
  extra?: ReactNode;
};

function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const btn =
  "rounded-full border-[1.5px] border-ink bg-canvas px-4 py-2 text-sm transition-colors hover:bg-lime hover:text-[color:var(--on-lime)] disabled:opacity-40 disabled:hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

export function ControlBar({ metronome, recorder, volume, onVolume, extra }: Props) {
  const recording = recorder.state === "recording";

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[32px] border-[1.5px] border-ink bg-page px-5 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => (recording ? recorder.stop() : recorder.start())}
          style={recording ? { backgroundColor: "var(--orange)", color: "#fff" } : undefined}
        >
          {recording ? "■ Stop" : "● Record"}
        </button>
        <button
          type="button"
          className={btn}
          disabled={recorder.eventCount === 0 || recording}
          onClick={() => (recorder.playing ? recorder.pause() : recorder.play())}
        >
          {recorder.playing ? "❚❚ Pause" : "▶ Play"}
        </button>
        <button
          type="button"
          className={btn}
          disabled={recorder.eventCount === 0 || recording}
          onClick={() => {
            const name = `Take ${new Date().toLocaleTimeString()}`;
            const saved = recorder.save(name);
            toast[saved ? "success" : "error"](
              saved ? `Saved "${name}"` : "Nothing to save yet.",
            );
          }}
        >
          Save
        </button>
        <button
          type="button"
          className={btn}
          disabled={recorder.eventCount === 0 || recording}
          onClick={recorder.discard}
        >
          Delete
        </button>
        <span
          className="flex items-center gap-2 font-mono text-xs"
          aria-live="polite"
          style={recording ? { color: "var(--destructive)" } : { color: "var(--muted-foreground)" }}
        >
          {recording && (
            <span
              className="rec-dot inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--destructive)" }}
            />
          )}
          {fmt(recorder.elapsed)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={btn}
          onClick={metronome.toggle}
          style={metronome.running ? { color: "var(--signal)" } : undefined}
        >
          Metronome {metronome.running ? "On" : "Off"}
        </button>
        <div className="flex gap-1" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  metronome.beat === i ? (i === 0 ? "var(--signal)" : "var(--foreground)") : "var(--panel-edge)",
              }}
            />
          ))}
        </div>
        <label className="flex items-center gap-2">
          <span className="label-mono">BPM</span>
          <input
            type="range"
            min={40}
            max={240}
            value={metronome.bpm}
            onChange={(e) => metronome.setBpm(Number(e.target.value))}
            className="w-28"
            style={{ accentColor: "var(--ink)" }}
            aria-label="Tempo in beats per minute"
          />
          <span className="w-8 font-mono text-xs">{metronome.bpm}</span>
        </label>
      </div>

      <label className="flex items-center gap-2">
        <span className="label-mono">Vol</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolume(Number(e.target.value) / 100)}
          className="w-28"
          style={{ accentColor: "var(--ink)" }}
          aria-label="Master volume"
        />
      </label>

      {extra}
    </div>
  );
}

export const controlButtonClass = btn;
