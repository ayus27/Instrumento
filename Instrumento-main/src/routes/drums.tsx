import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { ControlBar } from "@/components/instrument/ControlBar";
import { DrumKit, DRUM_PADS } from "@/components/instrument/DrumKit";
import { InstrumentShell } from "@/components/instrument/InstrumentShell";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useMetronome } from "@/hooks/useMetronome";
import { useRecorder } from "@/hooks/useRecorder";
import { getEngine } from "@/lib/audio/engine";

export const Route = createFileRoute("/drums")({
  head: () => ({
    meta: [
      { title: "Drums — Instrumento" },
      {
        name: "description",
        content:
          "Hit kick, snare, hi-hats, tom, crash and ride in the browser with mouse or keyboard, backed by a real metronome and performance recording.",
      },
      { property: "og:title", content: "Drums — Instrumento" },
      {
        property: "og:description",
        content: "Browser drum kit with keyboard pads, metronome and recording.",
      },
    ],
  }),
  component: DrumsPage,
});

function DrumsPage() {
  const [volume, setVolume] = useState(0.8);
  const [lit, setLit] = useState<string[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const instrument = useInstrument("drums");
  const metronome = useMetronome(100);

  const flash = useCallback((pad: string) => {
    setLit((prev) => (prev.includes(pad) ? prev : [...prev, pad]));
    const existing = timers.current[pad];
    if (existing) clearTimeout(existing);
    timers.current[pad] = setTimeout(
      () => setLit((prev) => prev.filter((p) => p !== pad)),
      110,
    );
  }, []);

  const hit = useCallback(
    (pad: string, velocity = 0.9) => {
      instrument.hit(pad, velocity);
      flash(pad);
    },
    [flash, instrument],
  );

  const recorder = useRecorder(
    "drums",
    { attack: () => {}, release: () => {}, hit: (pad, velocity) => hit(pad, velocity) },
    metronome.bpm,
  );

  useKeyboardInput({
    onDown: (key) => {
      const pad = DRUM_PADS.find((p) => p.key === key);
      if (pad) hit(pad.id);
    },
    onUp: () => {},
  });

  return (
    <InstrumentShell
      title="Drums"
      subtitle="Seven pads · Mouse + keyboard · Tempo-locked"
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
        />
      }
      legend={
        <div className="panel p-4">
          <p className="label-mono">Keyboard map</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {DRUM_PADS.map((p) => `${p.key.toUpperCase()} = ${p.label}`).join("   ·   ")}
          </p>
        </div>
      }
    >
      <DrumKit hitPads={lit} onHit={(pad) => hit(pad)} />
    </InstrumentShell>
  );
}
