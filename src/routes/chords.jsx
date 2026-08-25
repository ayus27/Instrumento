import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CHORD_DATABASE, findChord } from "@/lib/chords/chordData";
import { ChordDiagram } from "@/components/chord/ChordDiagram";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { useInstrument } from "@/hooks/useInstrument";
import { controlButtonClass } from "@/components/instrument/ControlBar";

export const Route = createFileRoute("/chords")({
  head: () => ({
    meta: [
      { title: "Chord Playground — Instrumento" },
      {
        name: "description",
        content: "Discover, visualize and play chords across Piano, Guitar and Ukulele.",
      },
    ],
  }),
  component: ChordPlaygroundPage,
});

function ChordPlaygroundPage() {
  const [selectedChordName, setSelectedChordName] = useState("C");
  const chord = findChord(selectedChordName);
  const pianoInstrument = useInstrument("piano-grand");

  const playChordNotes = () => {
    pianoInstrument.ensure();
    chord.pianoNotes.forEach((note) => {
      pianoInstrument.noteOn(note);
      setTimeout(() => pianoInstrument.noteOff(note), 1200);
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Chord Playground</h1>
          <p className="label-mono mt-1">Multi-instrument Chord Explorer & Finder</p>
        </div>

        <button
          type="button"
          onClick={playChordNotes}
          className={`${controlButtonClass} bg-signal text-primary-foreground`}
        >
          ▶ Play {chord.name} Chord
        </button>
      </header>

      <section className="panel p-4">
        <p className="label-mono mb-3">Select a Chord</p>
        <div className="flex flex-wrap gap-2">
          {CHORD_DATABASE.map((c) => (
            <button
              key={c.name}
              type="button"
              className={controlButtonClass}
              onClick={() => setSelectedChordName(c.name)}
              style={
                selectedChordName === c.name
                  ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                  : undefined
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex justify-center">
          <ChordDiagram chord={chord} instrumentType="guitar" className="w-full" />
        </div>
        <div className="flex justify-center">
          <ChordDiagram chord={chord} instrumentType="ukulele" className="w-full" />
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="label-mono">PIANO KEYS FOR {chord.fullName}</p>
          <span className="font-mono text-sm text-signal font-semibold">
            Notes: {chord.pianoNotes.join(" - ")}
          </span>
        </div>
        <PianoKeyboard
          startMidi={60}
          keyCount={17}
          active={[]}
          targets={chord.pianoNotes}
          onNoteOn={(note) => {
            pianoInstrument.ensure();
            pianoInstrument.noteOn(note);
          }}
          onNoteOff={(note) => pianoInstrument.noteOff(note)}
        />
      </div>
    </div>
  );
}
