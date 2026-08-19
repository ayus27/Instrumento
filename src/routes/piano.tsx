import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ControlBar, controlButtonClass } from "@/components/instrument/ControlBar";
import { InstrumentShell } from "@/components/instrument/InstrumentShell";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useMetronome } from "@/hooks/useMetronome";
import { useRecorder } from "@/hooks/useRecorder";
import { getEngine, type InstrumentId } from "@/lib/audio/engine";
import { midiToName } from "@/lib/audio/notes";

export const Route = createFileRoute("/piano")({
  head: () => ({
    meta: [
      { title: "Piano — Instrumento" },
      {
        name: "description",
        content:
          "Play a polyphonic browser piano with your mouse or computer keyboard: three tones, octave shift, sustain pedal, metronome and recording.",
      },
      { property: "og:title", content: "Piano — Instrumento" },
      {
        property: "og:description",
        content: "Polyphonic browser piano with keyboard control, sustain, metronome and recording.",
      },
    ],
  }),
  component: PianoPage,
});

const TONES: { id: InstrumentId; label: string }[] = [
  { id: "piano-grand", label: "Grand" },
  { id: "piano-soft", label: "Soft" },
  { id: "piano-electric", label: "Electric" },
];

const KEY_OFFSETS: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
  p: 15,
  ";": 16,
};

function PianoPage() {
  const [tone, setTone] = useState<InstrumentId>("piano-grand");
  const [octave, setOctave] = useState(4);
  const [sustainOn, setSustainOn] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const instrument = useInstrument(tone);
  const metronome = useMetronome(100);
  const recorder = useRecorder(
    tone,
    {
      attack: (note, velocity) => instrument.noteOn(note, velocity),
      release: (note) => instrument.noteOff(note),
      hit: () => {},
    },
    metronome.bpm,
  );

  const startMidi = (octave + 1) * 12;
  const keyLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    Object.entries(KEY_OFFSETS).forEach(([key, offset]) => {
      labels[midiToName(startMidi + offset)] = key.toUpperCase();
    });
    return labels;
  }, [startMidi]);

  const setSustain = useCallback(
    (on: boolean) => {
      setSustainOn(on);
      instrument.setSustain(on);
    },
    [instrument],
  );

  useKeyboardInput({
    onDown: (key) => {
      if (key === "space") {
        setSustain(true);
        return;
      }
      if (key === "arrowleft") return setOctave((o) => Math.max(1, o - 1));
      if (key === "arrowright") return setOctave((o) => Math.min(6, o + 1));
      const offset = KEY_OFFSETS[key];
      if (offset === undefined) return;
      instrument.noteOn(midiToName(startMidi + offset));
    },
    onUp: (key) => {
      if (key === "__blur__") return instrument.panic();
      if (key === "space") return setSustain(false);
      const offset = KEY_OFFSETS[key];
      if (offset === undefined) return;
      instrument.noteOff(midiToName(startMidi + offset));
    },
  });

  return (
    <InstrumentShell
      title="Piano"
      subtitle="Polyphonic · Mouse + keyboard · Sustain"
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
              <div className="flex items-center gap-1">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={controlButtonClass}
                    onClick={() => setTone(t.id)}
                    style={
                      tone === t.id
                        ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                        : undefined
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Octave down"
                  className={controlButtonClass}
                  onClick={() => setOctave((o) => Math.max(1, o - 1))}
                >
                  −
                </button>
                <span className="label-mono w-20 text-center">Octave {octave}</span>
                <button
                  type="button"
                  aria-label="Octave up"
                  className={controlButtonClass}
                  onClick={() => setOctave((o) => Math.min(6, o + 1))}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className={controlButtonClass}
                onPointerDown={() => setSustain(true)}
                onPointerUp={() => setSustain(false)}
                onPointerLeave={() => sustainOn && setSustain(false)}
                onClick={() => undefined}
                style={
                  sustainOn
                    ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                    : undefined
                }
              >
                Sustain (Space)
              </button>
            </div>
          }
        />
      }
      legend={
        <div className="panel p-4">
          <p className="label-mono">Keyboard map</p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs leading-5 text-muted-foreground">
{`   W   E       T   Y   U          O   P
  C#  D#      F#  G#  A#         C#  D#
 A   S   D F   G   H   J   K   L      ;
 C   D   E F   G   A   B   C   D   E  F`}
          </pre>
          <p className="label-mono mt-3">← / → shifts octave · Space holds sustain</p>
        </div>
      }
    >
      <PianoKeyboard
        startMidi={startMidi}
        keyCount={17}
        active={instrument.active}
        keyLabels={keyLabels}
        onNoteOn={(note) => instrument.noteOn(note)}
        onNoteOff={(note) => instrument.noteOff(note)}
      />
    </InstrumentShell>
  );
}
