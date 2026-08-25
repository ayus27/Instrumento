import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { useInstrument } from "@/hooks/useInstrument";

export const Route = createFileRoute("/grooves")({
  head: () => ({
    meta: [
      { title: "Drum Groove Generator — Instrumento" },
      {
        name: "description",
        content: "Browser step sequencer: compose drum grooves, customize BPM, randomize and playback live.",
      },
    ],
  }),
  component: GrooveGeneratorPage,
});

const LANES = [
  { id: "kick", name: "Kick" },
  { id: "snare", name: "Snare" },
  { id: "hihat", name: "Hi-Hat" },
  { id: "openhat", name: "Open Hat" },
  { id: "tom", name: "Tom" },
  { id: "crash", name: "Crash" },
];

const DEFAULT_GRID = {
  kick:    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  hihat:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  openhat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  tom:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  crash:   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

function GrooveGeneratorPage() {
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [bpm, setBpm] = useState(110);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const drumInst = useInstrument("drums");
  const timerRef = useRef(null);

  const toggleStep = (laneId, stepIdx) => {
    setGrid((prev) => {
      const copy = { ...prev };
      copy[laneId] = [...copy[laneId]];
      copy[laneId][stepIdx] = copy[laneId][stepIdx] ? 0 : 1;
      return copy;
    });
  };

  const clearGrid = () => {
    const empty = {};
    LANES.forEach((l) => (empty[l.id] = Array(16).fill(0)));
    setGrid(empty);
  };

  const randomizeGrid = () => {
    const rand = {};
    LANES.forEach((l) => {
      rand[l.id] = Array.from({ length: 16 }, () => (Math.random() > 0.75 ? 1 : 0));
    });
    setGrid(rand);
  };

  const togglePlay = async () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      await drumInst.ensure();
      let step = 0;
      const stepDurationMs = (60 / bpm) * 1000 / 4;

      timerRef.current = setInterval(() => {
        setCurrentStep(step);

        LANES.forEach((lane) => {
          if (grid[lane.id]?.[step]) {
            drumInst.hit(lane.id);
          }
        });

        step = (step + 1) % 16;
      }, stepDurationMs);

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
          <h1 className="font-display text-4xl uppercase tracking-tight">Drum Groove Generator</h1>
          <p className="label-mono mt-1">16-Step Browser Pattern Sequencer</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className={`${controlButtonClass} ${isPlaying ? "bg-destructive text-destructive-foreground" : "bg-signal text-primary-foreground"}`}
          >
            {isPlaying ? "■ Stop Groove" : "▶ Play Groove"}
          </button>
          <button type="button" onClick={randomizeGrid} className={controlButtonClass}>
            Randomize
          </button>
          <button type="button" onClick={clearGrid} className={controlButtonClass}>
            Clear
          </button>
        </div>
      </header>

      <div className="panel p-4 flex items-center justify-between">
        <label className="flex items-center gap-3">
          <span className="label-mono">TEMPO</span>
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-48"
            style={{ accentColor: "var(--signal)" }}
          />
          <span className="font-mono text-sm text-signal font-bold w-16">{bpm} BPM</span>
        </label>
        <span className="label-mono text-muted-foreground">16 SIXTEENTH STEPS</span>
      </div>

      <div className="panel p-5 overflow-x-auto">
        <div className="min-w-[640px] space-y-3">
          {LANES.map((lane) => (
            <div key={lane.id} className="flex items-center gap-4">
              <span className="label-mono w-24 shrink-0 font-bold">{lane.name}</span>
              <div className="grid flex-1 grid-cols-16 gap-1.5">
                {grid[lane.id].map((active, stepIdx) => {
                  const isCurrent = stepIdx === currentStep;
                  return (
                    <button
                      key={stepIdx}
                      type="button"
                      onClick={() => toggleStep(lane.id, stepIdx)}
                      className={`h-10 border transition-all duration-75 ${
                        active
                          ? "bg-signal border-signal"
                          : "bg-panel border-panel-edge hover:bg-accent"
                      } ${isCurrent ? "ring-2 ring-foreground" : ""}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2">
            <span className="w-24 shrink-0" />
            <div className="grid flex-1 grid-cols-16 gap-1.5">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className={`label-mono text-center text-[10px] ${
                    i === currentStep ? "text-signal font-bold" : ""
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
