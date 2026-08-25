import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PRACTICE_CHALLENGES } from "@/lib/practice/challenges";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { PracticePrompt } from "@/components/practice/PracticePrompt";
import { PracticeResults } from "@/components/practice/PracticeResults";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { DrumKit } from "@/components/instrument/DrumKit";
import { useInstrument } from "@/hooks/useInstrument";
import { usePracticeSession } from "@/hooks/usePracticeSession";

export const Route = createFileRoute("/practice/challenges")({
  head: () => ({
    meta: [
      { title: "Practice Challenges — Instrumento" },
      {
        name: "description",
        content: "High-energy timed music practice challenges: Note Rush, Melody Memory, Rhythm Rush, Chord Detective, and Speed Challenge.",
      },
    ],
  }),
  component: PracticeChallengesPage,
});

function PracticeChallengesPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const challenge = PRACTICE_CHALLENGES[selectedIdx];

  const pianoInst = useInstrument("piano-grand");
  const drumInst = useInstrument("drums");

  const practice = usePracticeSession(challenge.exercise);

  const handlePianoPlay = (note) => {
    pianoInst.ensure();
    pianoInst.noteOn(note);
    practice.input(note);
  };

  const handleDrumHit = (pad) => {
    drumInst.ensure();
    drumInst.hit(pad);
    practice.input(pad);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4">
        <h1 className="font-display text-4xl uppercase tracking-tight">Practice Challenges</h1>
        <p className="label-mono mt-1">Timed Music Rush & Memory Skill Challenges</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {PRACTICE_CHALLENGES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setSelectedIdx(i);
              practice.restart(PRACTICE_CHALLENGES[i].exercise);
            }}
            className={`panel p-4 text-left transition-colors ${
              selectedIdx === i ? "bg-accent border-signal" : "hover:bg-accent"
            }`}
          >
            <p className="label-mono text-signal">{c.instrument.toUpperCase()}</p>
            <h4 className="font-display text-lg uppercase tracking-tight mt-1">{c.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
          </button>
        ))}
      </div>

      <div className="panel p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-tight text-signal">
              {challenge.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{challenge.description}</p>
          </div>

          <button
            type="button"
            className={controlButtonClass}
            onClick={() => practice.restart(challenge.exercise)}
          >
            Restart Challenge
          </button>
        </div>

        {practice.score ? (
          <PracticeResults score={practice.score} onRetry={() => practice.restart(challenge.exercise)} />
        ) : (
          <PracticePrompt
            label={practice.step ? practice.step.label : "Complete"}
            sub={challenge.title}
            feedback={practice.feedback}
            progress={practice.progress}
            index={practice.session.index}
            total={challenge.exercise.steps.length}
          />
        )}

        {challenge.instrument === "piano" ? (
          <PianoKeyboard
            startMidi={60}
            keyCount={17}
            active={pianoInst.active}
            targets={practice.score ? [] : practice.targets}
            onNoteOn={handlePianoPlay}
            onNoteOff={(n) => pianoInst.noteOff(n)}
          />
        ) : (
          <DrumKit hitPads={[]} onHit={handleDrumHit} />
        )}
      </div>
    </div>
  );
}
