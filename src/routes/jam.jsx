    import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { JAM_STYLES, JAM_KEYS } from "@/lib/jam/patterns";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { DrumKit } from "@/components/instrument/DrumKit";
import { useInstrument } from "@/hooks/useInstrument";

export const Route = createFileRoute("/jam")({
  head: () => ({
    meta: [
      { title: "Jam Mode — Instrumento" },
      {
        name: "description",
        content: "Jam along with original backing grooves across Piano, Guitar, Drums or Ukulele.",
      },
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

  const pianoInst = useInstrument("piano-grand");
  const drumInst = useInstrument("drums");
  const timerRef = useRef(null);

  const togglePlay = async () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      await drumInst.ensure();
      let beat = 0;
      const intervalMs = (60 / bpm) * 1000 / 2;
      
      timerRef.current = setInterval(() => {
        if (beat % 4 === 0) drumInst.hit("kick", 0.7);
        if (beat % 4 === 2) drumInst.hit("snare", 0.6);
        if (beat % 2 === 0) drumInst.hit("hihat", 0.4);
        beat = (beat + 1) % 16;
      }, intervalMs);

      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Jam Mode</h1>
          <p className="label-mono mt-1">Backing Environments · Play Along live</p>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className={`${controlButtonClass} ${isPlaying ? "bg-destructive text-destructive-foreground" : "bg-signal text-primary-foreground"}`}
        >
          {isPlaying ? "■ Stop Backing Track" : "▶ Start Backing Track"}
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
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: "var(--signal)" }}
          />
        </div>

        <div>
          <label className="label-mono mb-2 block">Play Instrument</label>
          <div className="flex gap-1">
            {["piano", "guitar", "drums"].map((inst) => (
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

      <div className="panel p-4 flex items-center justify-between border-l-4 border-l-signal">
        <div>
          <p className="label-mono">CURRENT BACKING PROGRESSION</p>
          <p className="font-display text-xl text-signal mt-1">
            {selectedStyle.chords.join(" — ")} (Key of {selectedKey})
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-mono">{selectedStyle.description}</p>
      </div>

      <div className="panel p-5">
        {activeInstrument === "piano" && (
          <div className="space-y-4">
            <h3 className="label-mono">Jamming on Piano</h3>
            <PianoKeyboard
              startMidi={60}
              keyCount={17}
              active={pianoInst.active}
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
            <h3 className="label-mono">Jamming on Drums</h3>
            <DrumKit hitPads={[]} onHit={(pad) => drumInst.hit(pad)} />
          </div>
        )}

        {activeInstrument === "guitar" && (
          <div className="space-y-4">
            <h3 className="label-mono font-mono text-xs">Guitar Jamming Rig</h3>
            <p className="text-sm text-muted-foreground">Switch to main Guitar page for full fretboard or jam right here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
