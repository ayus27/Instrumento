import { createFileRoute, Link } from "@tanstack/react-router";
import { PIANO_LESSONS } from "@/lib/practice/pianoLessons";
import { DRUM_LESSONS } from "@/lib/practice/drumLessons";
import { PRACTICE_CHALLENGES } from "@/lib/practice/challenges";

export const Route = createFileRoute("/practice/")({
  head: () => ({
    meta: [
      { title: "Practice — Instrumento" },
      {
        name: "description",
        content:
          "Guided piano and drum lessons, interactive challenges, ear training and practice history.",
      },
    ],
  }),
  component: PracticeIndex,
});

function Card({ to, kicker, title, body, count }) {
  return (
    <Link to={to} className="panel block p-5 transition-colors hover:bg-accent">
      <p className="label-mono">{kicker}</p>
      <h2 className="font-display mt-1 text-2xl uppercase tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <p className="label-mono mt-3" style={{ color: "var(--signal)" }}>
        {count ? `${count} exercises →` : "Explore →"}
      </p>
    </Link>
  );
}

function PracticeIndex() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-tight">Practice Suite</h1>
        <p className="label-mono mt-1">Play → Learn → Practice → Create</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card
          to="/practice/piano/learn"
          kicker="Piano"
          title="Teach Me Piano"
          body="Single notes, sequences, scales, triads and public-domain melodies on the real keyboard."
          count={PIANO_LESSONS.length}
        />
        <Card
          to="/practice/drums/learn"
          kicker="Drums"
          title="Teach Me Drums"
          body="Read an eight-step grid, take the count-in, and play the groove on the real kit."
          count={DRUM_LESSONS.length}
        />
        <Card
          to="/practice/challenges"
          kicker="Challenges"
          title="Practice Challenges"
          body="Note Rush, Melody Memory, Rhythm Rush, Chord Detective, and Speed Challenge."
          count={PRACTICE_CHALLENGES.length}
        />
        <Card
          to="/chords"
          kicker="Chords"
          title="Chord Playground"
          body="Interactive chord library with multi-instrument fingerings for Piano, Guitar & Ukulele."
        />
        <Card
          to="/practice/ear"
          kicker="Ear Training"
          title="Train Your Ear"
          body="Aural skills, pitch identification, major/minor discrimination, and interval training."
        />
        <Card
          to="/practice/progress"
          kicker="Journey"
          title="Musical Journey"
          body="View your practice time, accuracy stats, best streaks, and personal achievements."
        />
      </div>
    </div>
  );
}
