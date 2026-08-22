import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ControlBar, controlButtonClass } from "@/components/instrument/ControlBar";
import { InstrumentShell } from "@/components/instrument/InstrumentShell";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { PracticePrompt } from "@/components/practice/PracticePrompt";
import { PracticeResults } from "@/components/practice/PracticeResults";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useMetronome } from "@/hooks/useMetronome";
import { useRecorder } from "@/hooks/useRecorder";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { getEngine } from "@/lib/audio/engine";
import { midiToName } from "@/lib/audio/notes";
import { PIANO_LESSONS } from "@/lib/practice/pianoLessons";

export const Route = createFileRoute("/practice/piano/learn")({
  head: () => ({
    meta: [
      { title: "Piano Teach Me — Instrumento" },
      {
        name: "description",
        content:
          "Guided piano lessons: play the highlighted key, work through scales, triads and melodies, and get scored on accuracy and streak.",
      },
      { property: "og:title", content: "Piano Teach Me — Instrumento" },
      {
        property: "og:description",
        content: "Guided piano lessons with highlighted keys and live accuracy scoring.",
      },
    ],
  }),
  component: PianoLearnPage,
});

const KEY_OFFSETS = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7,
  y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ";": 16,
};

const START_MIDI = 60; // C4

function PianoLearnPage() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const lesson = PIANO_LESSONS[lessonIndex];

  const instrument = useInstrument("piano-grand");
  const metronome = useMetronome(80);
  const recorder = useRecorder(
    "piano-grand",
    {
      attack: (note, velocity) => instrument.noteOn(note, velocity),
      release: (note) => instrument.noteOff(note),
      hit: () => {},
    },
    metronome.bpm,
  );
  const practice = usePracticeSession(lesson);

  const keyLabels = useMemo(() => {
    const labels = {};
    Object.entries(KEY_OFFSETS).forEach(([key, offset]) => {
      labels[midiToName(START_MIDI + offset)] = key.toUpperCase();
    });
    return labels;
  }, []);

  const play = useCallback(
    (note) => {
      instrument.noteOn(note);
      practice.input(note);
    },
    [instrument, practice],
  );

  useKeyboardInput({
    onDown: (key) => {
      const offset = KEY_OFFSETS[key];
      if (offset === undefined) return;
      play(midiToName(START_MIDI + offset));
    },
    onUp: (key) => {
      if (key === "__blur__") return instrument.panic();
      const offset = KEY_OFFSETS[key];
      if (offset === undefined) return;
      instrument.noteOff(midiToName(START_MIDI + offset));
    },
  });

  const selectLesson = (index) => {
    setLessonIndex(index);
    practice.restart(PIANO_LESSONS[index]);
    instrument.panic();
  };

  const promptLabel = practice.step ? practice.step.label : "Done";

  return (
    <InstrumentShell
      title="Piano · Teach me"
      subtitle={`${lesson.title} · ${lesson.prompt}`}
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
            <div className="flex flex-wrap items-center gap-1">
              {PIANO_LESSONS.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  className={controlButtonClass}
                  onClick={() => selectLesson(i)}
                  style={
                    i === lessonIndex
                      ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                      : undefined
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className={`${controlButtonClass} ml-2`}
                onClick={() => practice.restart(lesson)}
              >
                Restart
              </button>
            </div>
          }
        />
      }
      legend={
        <div className="panel p-4">
          <p className="label-mono">Lesson {lessonIndex + 1} — {lesson.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{lesson.prompt}</p>
          <p className="label-mono mt-3">
            Mouse or computer keyboard (A S D F G H J …). Chords need every key held in turn.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {practice.score ? (
          <PracticeResults
            score={practice.score}
            onRetry={() => practice.restart(lesson)}
            onNext={
              lessonIndex < PIANO_LESSONS.length - 1
                ? () => selectLesson(lessonIndex + 1)
                : undefined
            }
            nextLabel="Next lesson"
          />
        ) : (
          <PracticePrompt
            label={promptLabel}
            sub={lesson.title}
            feedback={practice.feedback}
            progress={practice.progress}
            index={practice.session.index}
            total={lesson.steps.length}
          />
        )}

        <PianoKeyboard
          startMidi={START_MIDI}
          keyCount={17}
          active={instrument.active}
          keyLabels={keyLabels}
          targets={practice.score ? [] : practice.targets}
          onNoteOn={play}
          onNoteOff={(note) => instrument.noteOff(note)}
        />
      </div>
    </InstrumentShell>
  );
}
