import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { JAM_STYLES, JAM_KEYS } from "@/lib/jam/patterns";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { DrumKit, DRUM_PADS } from "@/components/instrument/DrumKit";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { midiToName } from "@/lib/audio/notes";
import { PIANO_KEY_OFFSETS, chordNotes, semitoneOf, shiftChord } from "@/lib/audio/pianoKeys";

export const Route = createFileRoute("/jam")({
  head: () => ({
    meta: [
      { title: "Jam Mode — Instrumento" },
      {
        name: "description",
        content: "Jam along with backing grooves and chord progressions on piano or drums, using your keyboard.",
      },
      { property: "og:title", content: "Jam Mode — Instrumento" },
      {
        property: "og:description",
        content: "Backing grooves, chord progressions and live play-along on piano and drums.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JamPage,
});

function JamPage() {
  const [selectedStyle, setSelectedStyle] = useState(JAM_STYLES[0]);
  const [selectedKey, setSelectedKey] = useState("C");
  const [bpm, setBpm] = useState(JAM_STYLES[0].bpm);
  const [activeInstrument, setActiveInstrument] = useState("piano");
  const [isPlaying, setIsPlaying] = useState(false);
  const [barIndex, setBarIndex] = useState(-1);
  const [octave, setOctave] = useState(4);
  const [hitPads, setHitPads] = useState([]);

  const pianoInst = useInstrument("piano-grand");
  const padInst = useInstrument("piano-soft");
  const drumInst = useInstrument("drums");
  const timerRef = useRef(null);

  const shift = semitoneOf(selectedKey) - semitoneOf(selectedStyle.chords[0].replace(/m.*$/, ""));
  const chords = useMemo(
    () => selectedStyle.chords.map((c) => shiftChord(c, shift)),
    [selectedStyle, shift],
  );

  const startMidi = (octave + 1) * 12;
  const keyLabels = useMemo(() => {
    const labels = {};
    Object.entries(PIANO_KEY_OFFSETS).forEach(([key, offset]) => {
      labels[midiToName(startMidi + offset)] = key.toUpperCase();
    });
    return labels;
  }, [startMidi]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
    setBarIndex(-1);
  }, []);

  const togglePlay = async () => {
    if (isPlaying) return stop();
    await drumInst.ensure();
    await padInst.ensure();
    let beat = 0;
    const intervalMs = ((60 / bpm) * 1000) / 2; // eighth notes

    timerRef.current = setInterval(() => {
      const inBar = beat % 8;
      const bar = Math.floor(beat / 8) % chords.length;
      if (inBar === 0) {
        setBarIndex(bar);
        chordNotes(chords[bar], 3).forEach((note) => {
          padInst.noteOn(note, 0.35);
          setTimeout(() => padInst.noteOff(note), ((60 / bpm) * 1000 * 3.6));
        });
      }
      if (inBar % 4 === 0) drumInst.hit("kick", 0.7);
      if (inBar % 4 === 2) drumInst.hit("snare", 0.6);
      drumInst.hit("hihat", inBar % 2 === 0 ? 0.4 : 0.25);
      beat = (beat + 1) % (8 * chords.length);
    }, intervalMs);

    setIsPlaying(true);
  };

  useEffect(() => () => stop(), [stop]);

  const flashPad = (pad) => {
    setHitPads((p) => [...p, pad]);
    setTimeout(() => setHitPads((p) => p.filter((_, i) => i !== 0)), 120);
  };

  useKeyboardInput({
    enabled: activeInstrument === "piano" || activeInstrument === "drums",
    onDown: (key) => {
      if (activeInstrument === "drums") {
        const pad = DRUM_PADS.find((p) => p.key === key);
        if (pad) {
          drumInst.ensure();
          drumInst.hit(pad.id);
          flashPad(pad.id);
        }
        return;
      }
      if (activeInstrument !== "piano") return;
      if (key === "arrowleft") return setOctave((o) => Math.max(1, o - 1));
      if (key === "arrowright") return setOctave((o) => Math.min(6, o + 1));
      const offset = PIANO_KEY_OFFSETS[key];
      if (offset === undefined) return;
      pianoInst.ensure();
      pianoInst.noteOn(midiToName(startMidi + offset));
    },
    onUp: (key) => {
      if (activeInstrument !== "piano") return;
      if (key === "__blur__") return pianoInst.panic();
      const offset = PIANO_KEY_OFFSETS[key];
      if (offset === undefined) return;
      pianoInst.noteOff(midiToName(startMidi + offset));
    },
  });

  const playChord = async (chord) => {
    await pianoInst.ensure();
    chordNotes(chord, 4).forEach((note) => {
      pianoInst.noteOn(note, 0.7);
      setTimeout(() => pianoInst.noteOff(note), 900);
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Jam Mode</h1>
          <p className="label-mono mt-1">Backing grooves · play along live</p>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className={`${controlButtonClass} ${isPlaying ? "bg-destructive text-destructive-foreground" : "bg-signal text-primary-foreground"}`}
        >
          {isPlaying ? "■ Stop backing track" : "▶ Start backing track"}
        </button>
      </header>

      <div className="panel p-5 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="label-mono mb-2 block">Style</label>
          <select
            value={selectedStyle.id}
            onChange={(e) => {
              const st = JAM_STYLES.find((s) => s.id === e.target.value);
              if (st) {
                setSelectedStyle(st);
                setBpm(st.bpm);
                stop();
              }
            }}
            className="w-full panel p-2 font-mono text-xs text-foreground bg-background"
          >
            {JAM_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.bpm} BPM)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-mono mb-2 block">Key</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full panel p-2 font-mono text-xs text-foreground bg-background"
          >
            {JAM_KEYS.map((k) => (
              <option key={k} value={k}>
                Key of {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-mono mb-2 flex justify-between">
            <span>Tempo</span>
            <span>{bpm} BPM</span>
          </label>
          <input
            type="range"
            min={50}
            max={180}
            value={bpm}
            onChange={(e) => {
              setBpm(Number(e.target.value));
              if (isPlaying) stop();
            }}
            className="w-full"
            style={{ accentColor: "var(--signal)" }}
          />
        </div>

        <div>
          <label className="label-mono mb-2 block">Play instrument</label>
          <div className="flex gap-1">
            {["piano", "drums"].map((inst) => (
              <button
                key={inst}
                type="button"
                className={controlButtonClass}
                onClick={() => setActiveInstrument(inst)}
                style={
                  activeInstrument === inst
                    ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                    : undefined
                }
              >
                {inst}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel p-4 border-l-4 border-l-signal">
        <p className="label-mono">Backing progression · {selectedStyle.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {chords.map((chord, i) => (
            <button
              key={`${chord}-${i}`}
              type="button"
              onClick={() => playChord(chord)}
              className={`panel px-4 py-2 font-display text-lg transition-colors hover:bg-accent ${
                barIndex === i ? "bg-signal text-primary-foreground" : ""
              }`}
            >
              {chord}
            </button>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        {activeInstrument === "piano" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="label-mono">Piano · use A–; keys, ←/→ to change octave</h3>
              <span className="label-mono">Octave {octave}</span>
            </div>
            <PianoKeyboard
              startMidi={startMidi}
              keyCount={17}
              active={pianoInst.active}
              keyLabels={keyLabels}
              onNoteOn={(n) => {
                pianoInst.ensure();
                pianoInst.noteOn(n);
              }}
              onNoteOff={(n) => pianoInst.noteOff(n)}
            />
          </div>
        )}

        {activeInstrument === "drums" && (
          <div className="space-y-4">
            <h3 className="label-mono">Drums · hit pads or use A S D F G H J</h3>
            <DrumKit
              hitPads={hitPads}
              onHit={(pad) => {
                drumInst.ensure();
                drumInst.hit(pad);
                flashPad(pad);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
