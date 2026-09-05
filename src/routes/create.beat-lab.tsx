import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Play, Square, Settings2 } from "lucide-react";
import { BeatLab } from "../components/studio/BeatLab";

export const Route = createFileRoute("/create/beat-lab")({
  head: () => ({
    meta: [
      { title: "Beat Lab — Instrumento" },
      { name: "description", content: "Browser-based step sequencer." },
    ],
  }),
  component: BeatLabPage,
});

function BeatLabPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-4xl">BEAT LAB</h1>
          <p className="text-technical mt-1">16-Step Browser Pattern Sequencer</p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-signal px-4 py-2 text-sm font-bold text-primary-foreground rounded-sm hover:bg-signal-dim transition-colors">
            <Play className="h-4 w-4" /> PLAY
          </button>
          <button className="flex items-center gap-2 studio-panel px-4 py-2 text-sm hover:bg-accent transition-colors">
            <Square className="h-4 w-4" /> STOP
          </button>
        </div>
      </header>

      {/* BPM / Swing bar */}
      <div className="control-group justify-between">
        <label className="flex items-center gap-3">
          <span className="text-technical">TEMPO</span>
          <input
            type="range"
            min={60}
            max={180}
            defaultValue={110}
            className="w-48"
            style={{ accentColor: "var(--signal)" }}
          />
          <span className="font-mono text-sm text-signal font-bold w-16">110 BPM</span>
        </label>

        <label className="flex items-center gap-3">
          <span className="text-technical flex items-center gap-1"><Settings2 className="w-3 h-3" /> SWING</span>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={0}
            className="w-32"
            style={{ accentColor: "var(--signal)" }}
          />
        </label>
      </div>

      {/* Sequencer Grid Area */}
      <div className="studio-panel p-5 overflow-x-auto min-h-[400px] flex items-center justify-center">
        <div className="min-w-[800px] w-full">
          <BeatLab steps={16} />
        </div>
      </div>
    </div>
  );
}
