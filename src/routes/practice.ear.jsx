import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { useInstrument } from "@/hooks/useInstrument";

export const Route = createFileRoute("/practice/ear")({
  head: () => ({
    meta: [
      { title: "Ear Training — Instrumento" },
      {
        name: "description",
        content: "Train your ear: pitch comparison, note identification, chord quality, and intervals.",
      },
    ],
  }),
  component: EarTrainingPage,
});

const EAR_LEVELS = [
  { id: 1, title: "Level 1: Which note is higher?", type: "pitch_compare" },
  { id: 2, title: "Level 2: Identify the Note", type: "note_id" },
  { id: 3, title: "Level 3: Major or Minor?", type: "chord_quality" },
  { id: 4, title: "Level 4: Identify the Chord", type: "chord_id" },
  { id: 5, title: "Level 5: Identify the Interval", type: "interval_id" },
];

function EarTrainingPage() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const pianoInst = useInstrument("piano-grand");

  const currentLevel = EAR_LEVELS[levelIndex];

  const playPitchComparison = async () => {
    await pianoInst.ensure();
    pianoInst.noteOn("C4");
    setTimeout(() => {
      pianoInst.noteOff("C4");
      pianoInst.noteOn("G4");
      setTimeout(() => pianoInst.noteOff("G4"), 800);
    }, 600);
  };

  const handleAnswer = (isCorrect) => {
    setTotal((t) => t + 1);
    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback("✓ Correct! Brilliant ear!");
    } else {
      setFeedback("✗ Not quite, try again!");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Train Your Ear</h1>
          <p className="label-mono mt-1">Aural Skills & Pitch Recognition</p>
        </div>

        <div className="panel px-4 py-2 font-mono text-xs">
          Score: <span className="text-signal font-bold">{score} / {total}</span>
        </div>
      </header>

      <div className="panel p-4 flex flex-wrap gap-2">
        {EAR_LEVELS.map((lvl, idx) => (
          <button
            key={lvl.id}
            type="button"
            className={controlButtonClass}
            onClick={() => {
              setLevelIndex(idx);
              setFeedback(null);
            }}
            style={
              levelIndex === idx
                ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                : undefined
            }
          >
            L{lvl.id}
          </button>
        ))}
      </div>

      <div className="panel p-6 space-y-6 text-center">
        <h3 className="font-display text-2xl uppercase tracking-tight text-signal">
          {currentLevel.title}
        </h3>

        <button
          type="button"
          onClick={playPitchComparison}
          className={`${controlButtonClass} bg-signal text-primary-foreground px-6 py-3 text-sm`}
        >
          🔊 Listen to Audio Sample
        </button>

        <div className="flex justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => handleAnswer(false)}
            className={`${controlButtonClass} px-6 py-3`}
          >
            Note 1 (First Note)
          </button>
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            className={`${controlButtonClass} bg-accent px-6 py-3 font-bold`}
          >
            Note 2 (Second Note)
          </button>
        </div>

        {feedback && (
          <p className="font-mono text-sm pt-2" style={{ color: feedback.startsWith("✓") ? "var(--signal)" : "var(--destructive)" }}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
