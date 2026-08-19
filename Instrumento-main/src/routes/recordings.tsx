import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import {
  deleteRecording,
  loadRecordings,
  playEvents,
  type SavedRecording,
} from "@/lib/audio/recorder";
import { getEngine, type InstrumentId } from "@/lib/audio/engine";

export const Route = createFileRoute("/recordings")({
  head: () => ({
    meta: [
      { title: "Recordings — Instrumento" },
      {
        name: "description",
        content:
          "Replay and manage performances captured in Instrumento — every take is stored as note events and replayed through the same audio engine.",
      },
      { property: "og:title", content: "Recordings — Instrumento" },
      {
        property: "og:description",
        content: "Replay and manage takes recorded in Instrumento.",
      },
    ],
  }),
  component: RecordingsPage,
});

function RecordingsPage() {
  const [items, setItems] = useState<SavedRecording[]>([]);
  const [stopFn, setStopFn] = useState<null | (() => void)>(null);

  useEffect(() => {
    setItems(loadRecordings());
  }, []);

  const play = async (rec: SavedRecording) => {
    stopFn?.();
    const voice = await getEngine().load(rec.instrument as InstrumentId);
    const stop = playEvents(
      rec.events,
      {
        attack: (note, velocity) => voice.attack(note, velocity),
        release: (note) => voice.release(note),
        hit: (pad, velocity) => voice.hit(pad, velocity),
      },
      () => setStopFn(null),
    );
    setStopFn(() => stop);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <header className="hairline pb-4">
        <h1 className="font-display text-4xl uppercase tracking-tight">Recordings</h1>
        <p className="label-mono mt-1">
          Stored in this browser · Note events replayed by the live instrument engine
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">
          No takes yet. Record on any instrument page and press Save.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((rec) => (
            <li
              key={rec.id}
              className="panel flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-display text-lg">{rec.name}</p>
                <p className="label-mono mt-1">
                  {rec.instrument} · {rec.bpm} bpm · {(rec.duration / 1000).toFixed(1)}s ·{" "}
                  {rec.events.length} events
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={controlButtonClass} onClick={() => void play(rec)}>
                  ▶ Play
                </button>
                <button
                  type="button"
                  className={controlButtonClass}
                  onClick={() => {
                    stopFn?.();
                    setStopFn(null);
                  }}
                >
                  ■ Stop
                </button>
                <button
                  type="button"
                  className={controlButtonClass}
                  onClick={() => {
                    deleteRecording(rec.id);
                    setItems(loadRecordings());
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
