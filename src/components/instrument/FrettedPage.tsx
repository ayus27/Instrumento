import { useCallback, useState } from "react";
import { ControlBar, controlButtonClass } from "@/components/instrument/ControlBar";
import { Fretboard } from "@/components/instrument/Fretboard";
import { InstrumentShell } from "@/components/instrument/InstrumentShell";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useMetronome } from "@/hooks/useMetronome";
import { useRecorder } from "@/hooks/useRecorder";
import { getEngine, type InstrumentId } from "@/lib/audio/engine";
import { midiToName, nameToMidi } from "@/lib/audio/notes";

export type FrettedProps = {
  title: string;
  subtitle: string;
  tuning: string[];
  modes: { id: InstrumentId; label: string }[];
  maxFret: number;
};

export function FrettedPage({ title, subtitle, tuning, modes, maxFret }: FrettedProps) {
  const [mode, setMode] = useState<InstrumentId>(modes[0]?.id ?? "guitar-acoustic");
  const [fretStart, setFretStart] = useState(1);
  const [keyFret, setKeyFret] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const instrument = useInstrument(mode);
  const metronome = useMetronome(100);
  const recorder = useRecorder(
    mode,
    {
      attack: (note, velocity) => instrument.noteOn(note, velocity),
      release: (note) => instrument.noteOff(note),
      hit: () => {},
    },
    metronome.bpm,
  );

  const pluck = useCallback(
    (note: string) => {
      instrument.noteOn(note);
      // Plucked strings decay naturally; release immediately so re-triggering works.
      window.setTimeout(() => instrument.noteOff(note), 40);
    },
    [instrument],
  );

  const strum = useCallback(() => {
    tuning.forEach((open, i) => {
      window.setTimeout(() => pluck(midiToName(nameToMidi(open) + keyFret)), i * 28);
    });
  }, [keyFret, pluck, tuning]);

  const stringKeys = tuning.map((_, i) => String(i + 1));

  useKeyboardInput({
    onDown: (key) => {
      if (key === "g") return strum();
      const index = stringKeys.indexOf(key);
      if (index === -1) return;
      const open = tuning[index];
      if (!open) return;
      pluck(midiToName(nameToMidi(open) + keyFret));
    },
    onUp: (key) => {
      if (key === "__blur__") instrument.panic();
    },
  });

  return (
    <InstrumentShell
      title={title}
      subtitle={subtitle}
      status={instrument.status}
      error={instrument.error}
      onEnable={() => void instrument.ensure()}
      controls={
        <ControlBar
          metronome={metronome}
          recorder={recorder}
          volume={volume}
          onVolume={(v) => {
            setVolume(v);
            getEngine().setVolume(v);
          }}
          extra={
            <div className="flex flex-wrap items-center gap-3">
              {modes.length > 1 && (
                <div className="flex items-center gap-1">
                  {modes.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={controlButtonClass}
                      onClick={() => setMode(m.id)}
                      style={
                        mode === m.id
                          ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                          : undefined
                      }
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2">
                <span className="label-mono">Fret window</span>
                <input
                  type="range"
                  min={1}
                  max={maxFret - 4}
                  value={fretStart}
                  onChange={(e) => setFretStart(Number(e.target.value))}
                  className="w-36"
                  style={{ accentColor: "var(--signal)" }}
                  aria-label="First visible fret"
                />
                <span className="w-14 font-mono text-xs">
                  {fretStart}–{fretStart + 4}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <span className="label-mono">Key fret</span>
                <input
                  type="range"
                  min={0}
                  max={maxFret}
                  value={keyFret}
                  onChange={(e) => setKeyFret(Number(e.target.value))}
                  className="w-28"
                  style={{ accentColor: "var(--signal)" }}
                  aria-label="Fret used by keyboard shortcuts"
                />
                <span className="w-6 font-mono text-xs">{keyFret}</span>
              </label>
              <button type="button" className={controlButtonClass} onClick={strum}>
                Strum (G)
              </button>
            </div>
          }
        />
      }
      legend={
        <div className="panel p-4">
          <p className="label-mono">Keyboard map</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {tuning
              .map((open, i) => `${i + 1} = ${open} string`)
              .join("   ·   ")}{" "}
            · G = strum · Key fret slider transposes the shortcuts.
          </p>
        </div>
      }
    >
      <Fretboard
        tuning={tuning}
        fretStart={fretStart}
        fretCount={5}
        active={instrument.active}
        stringKeys={stringKeys}
        onPluck={pluck}
      />
    </InstrumentShell>
  );
}
