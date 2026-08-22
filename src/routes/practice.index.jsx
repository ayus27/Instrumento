import { createFileRoute, Link } from "@tanstack/react-router";
import { PIANO_LESSONS } from "@/lib/practice/pianoLessons";
import { DRUM_LESSONS } from "@/lib/practice/drumLessons";

export const Route = createFileRoute("/practice/")({
  head: () => ({
    meta: [
      { title: "Practice — Instrumento" },
      {
        name: "description",
        content:
          "Guided piano and drum lessons in the browser: play the prompted notes and rhythms, get scored on accuracy, streak and timing.",
      },
      { property: "og:title", content: "Practice — Instrumento" },
      {
        property: "og:description",
        content: "Guided piano and drum practice with live scoring, on the instruments you already play.",
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
        {count} exercises →
      </p>
    </Link>
  );
}

function PracticeIndex() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl uppercase tracking-tight">Practice</h1>
      <p className="label-mono mt-1">Play → Learn → Repeat</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card
          to="/practice/piano/learn"
          kicker="Piano"
          title="Teach me"
          body="Single notes, sequences, scales, triads and public-domain melodies on the real keyboard."
          count={PIANO_LESSONS.length}
        />
        <Card
          to="/practice/drums/learn"
          kicker="Drums"
          title="Teach me"
          body="Read an eight-step grid, take the count-in, and play the groove on the real kit."
          count={DRUM_LESSONS.length}
        />
      </div>

      <p className="label-mono mt-8">Challenges and progress tracking arrive next.</p>
    </div>
  );
}
