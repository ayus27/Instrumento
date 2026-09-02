import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChordLine } from "./ChordLine";
import { TransposeControls } from "./TransposeControls";
import { AutoScrollControls } from "./AutoScrollControls";
import { ChordDiagram } from "@/components/chord/ChordDiagram";
import { findChord } from "@/lib/chords/chordData";
import { useInstrument } from "@/hooks/useInstrument";
import { controlButtonClass } from "@/components/instrument/ControlBar";

export function SongViewer({ song }) {
  const [semitones, setSemitones] = useState(0);
  const [activeChord, setActiveChord] = useState(null);
  const scrollRef = useRef(null);
  const piano = useInstrument("piano-grand");

  const onChordClick = (name) => {
    setActiveChord(name);
    void piano.ensure().then(() => {
      const chord = findChord(name);
      chord?.pianoNotes?.forEach((n) => {
        piano.noteOn(n);
        setTimeout(() => piano.noteOff(n), 700);
      });
    });
  };

  const diagram = activeChord ? findChord(activeChord) : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-5 py-8">
      <header className="hairline flex flex-wrap items-end justify-between gap-4 pb-4">
        <div>
          <Link to="/songs" className="label-mono hover:text-foreground">
            ← All songs
          </Link>
          <h1 className="font-display text-4xl uppercase tracking-tight">{song.title}</h1>
          <p className="label-mono mt-1 text-muted-foreground">
            {song.artist} · {song.language}
            {song.genre ? ` · ${song.genre}` : ""}
          </p>
        </div>
        <p className="label-mono text-signal">
          Key: {song.originalKey}
          {song.capo ? ` · Capo: ${song.capo}` : " · Capo: none"}
          {song.tempo ? ` · ${song.tempo} BPM` : ""}
        </p>
      </header>

      <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
        <TransposeControls
          semitones={semitones}
          onChange={setSemitones}
          originalKey={song.originalKey}
        />
        <AutoScrollControls containerRef={scrollRef} />
      </div>

      {diagram && (
        <div className="panel flex items-center justify-between gap-4 p-4">
          <div>
            <p className="label-mono">Chord · {activeChord}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Tap any chord in the sheet to hear it and see the shape.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ChordDiagram chord={diagram} instrumentType="guitar" />
            <button
              type="button"
              className={controlButtonClass}
              onClick={() => setActiveChord(null)}
            >
              Hide
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="panel max-h-[65vh] space-y-6 overflow-y-auto p-4 sm:p-6"
        style={{ scrollBehavior: "auto" }}
      >
        {song.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            <h2 className="label-mono font-bold text-signal">{section.type}</h2>
            {section.lines.map((line, j) => (
              <ChordLine key={j} line={line} semitones={semitones} onChordClick={onChordClick} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
