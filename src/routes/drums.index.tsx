import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ControlBar } from "@/components/instrument/ControlBar";
import { DrumKit } from "@/components/instrument/DrumKit";
import { InstrumentShell } from "@/components/instrument/InstrumentShell";
import { DrumKeySettings } from "@/components/drums/DrumKeySettings";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useMetronome } from "@/hooks/useMetronome";
import { useRecorder } from "@/hooks/useRecorder";
import { getEngine } from "@/lib/audio/engine";
import {
  DEFAULT_KEY_MAP,
  DRUM_PIECES,
  keyLabel,
  loadKeyMap,
  saveKeyMap,
} from "@/lib/drums/drumKeyMap";

export const Route = createFileRoute("/drums/")({
  head: () => ({
    meta: [
      { title: "Drums — Instrumento" },
      {
        name: "description",
        content:
          "Hit kick, snare, hi-hats, tom, crash and ride in the browser with custom keyboard mappings, metronome and recording.",
      },
      { property: "og:title", content: "Drums — Instrumento" },
      {
        property: "og:description",
        content: "Browser drum kit with custom key mapping, metronome and recording.",
      },
    ],
  }),
  component: DrumsPage,
});

function DrumsPage() {
  const [volume, setVolume] = useState(0.8);
  const [lit, setLit] = useState<string[]>([]);
  const [keyMap, setKeyMap] = useState<Record<string, string>>(DEFAULT_KEY_MAP);
  const [capturing, setCapturing] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  // Persisted mapping is read after mount so SSR and hydration match.
  useEffect(() => {
    setKeyMap(loadKeyMap());
  }, []);

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
    enabled: !capturing,
    onDown: (key) => {
      const match = DRUM_PIECES.find((p) => keyMapRef.current[p.id] === key);
      if (match) hit(match.id);
    },
    onUp: () => {},
  });

  const labels: Record<string, string> = {};
  for (const piece of DRUM_PIECES) labels[piece.id] = keyLabel(keyMap[piece.id]);

  return (
    <InstrumentShell
      title="Drums"
      subtitle="Seven pads · Touch + custom keyboard · Tempo-locked"
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
            <Link to="/drums/tuner" className="label-mono hover:text-foreground">
              Drum tuner →
            </Link>
          }
        />
      }
      legend={
        <DrumKeySettings
          keyMap={keyMap}
          onChange={(next: Record<string, string>) => {
            setKeyMap(next);
            saveKeyMap(next);
          }}
          onCapturingChange={setCapturing}
        />
      }
    >
      <DrumKit hitPads={lit} onHit={(pad) => hit(pad)} keyLabels={labels} />
    </InstrumentShell>
  );
}
