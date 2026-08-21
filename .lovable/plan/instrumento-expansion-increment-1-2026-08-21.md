# Instrumento — Expansion, Increment 1

Ready. The spec covers 18 steps; shipping them at once would risk the working app. This plan covers Steps 1–4 (audit, Practice Engine, Piano Teach Me, Drum Teach Me) as one safe, polished increment. Later phases (Challenges, Chord Playground, Jam, Groove Generator, Songs, Sessions, History, Ear Training) get their own plans, in the order you listed.

## Ground rules honoured
- No redesign. New screens reuse the existing panel/label-mono/signal token styling.
- No new instrument code: practice drives the existing `useInstrument`, `PianoKeyboard`, `DrumKit`, `useKeyboardInput`, `useMetronome` and the Tone.js engine.
- Nothing existing is removed or replaced.

## Step 1 — Audit and stabilize
Browser pass over every existing route: piano (mouse + keyboard), guitar (frets, acoustic/electric), drums, ukulele, both tuners, recording + playback, metronome, sustain, appearance menu, signup/login/logout, plus a console check and a production build. Anything broken gets fixed before feature work — the signup/login form submit path is already flagged from earlier work and is first in line.

## Step 2 — Practice Engine (shared)
One instrument-agnostic core, no per-instrument copies:
- `PracticeExercise` — ordered steps, each expecting note(s) or drum pad(s), optional timing window and BPM.
- `PracticeSession` — runtime state machine: current step, awaiting input, judge input, advance/retry, finish.
- `PracticeEvent` — a judged input (correct / wrong / missed / extra, with timing delta).
- `PracticeResult` / `PracticeScore` — correct, incorrect, missed, accuracy, duration, best streak, BPM.
- A `usePracticeSession` hook that any instrument page feeds inputs into.

Scoring is local this increment; persistence to Neon arrives with Practice History (Step 16).

## Step 3 — Piano Teach Me
Route `/practice/piano/learn`. Renders the real `PianoKeyboard` with a prompt strip above it ("PLAY C") and a target-key highlight distinct from the played-key highlight. Correct input advances; wrong input flashes and is counted. Lesson ladder: single notes → note sequences → ascending/descending scales → basic triads → short melodies → melody with metronome timing. Ends on a compact results card (accuracy, correct, missed, best streak) in the existing visual language.

## Step 4 — Drum Teach Me
Route `/practice/drums/learn`. A grid pattern readout (kick / snare / hi-hat across 8 steps) plus the existing `DrumKit`. A count-in from the existing metronome, then hits are judged against the step grid with a timing window; wrong pad, missed and extra hits are all scored. Difficulty ramps by pattern density and BPM.

## Navigation
One new top-level nav item, `Practice`, with an index at `/practice` listing Piano → Learn and Drums → Learn (Challenges and Progress appear as those steps land). No nav item per feature.

## Technical notes
- New files: `src/lib/practice/*` (engine, exercise definitions), `src/hooks/usePracticeSession.js`, `src/components/practice/*` (prompt strip, pattern grid, results card), routes `src/routes/practice.index`, `practice.piano.learn`, `practice.drums.learn`.
- Piano target highlighting is added as an optional prop on `PianoKeyboard` (default off), so the existing piano page is untouched in behaviour.
- Drum judging uses the audio-clock time already available from the engine rather than `Date.now()`, so timing matches what the user hears.
- Written in plain-JS style, matching the auth/appearance files.
- After the increment: re-run the full Phase 1 checklist plus a production build before anything new starts.
