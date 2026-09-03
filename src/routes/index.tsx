import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instrumento — Browser Music Playground" },
      {
        name: "description",
        content:
          "Browser music playground: play piano, guitar, drums & ukulele, practice lessons & challenges, jam with backing tracks, explore chords, compose grooves & browse songbook.",
      },
      { property: "og:title", content: "Instrumento — Browser Music Playground" },
      {
        property: "og:description",
        content: "PLAY → LEARN → PRACTICE → CREATE",
      },
    ],
  }),
  component: Index,
});

const INSTRUMENTS = [
  { to: "/piano", name: "Piano", detail: "Polyphonic · Mouse & Keyboard" },
  { to: "/guitar", name: "Guitar", detail: "Acoustic & Electric · Fretboard" },
  { to: "/drums", name: "Drums", detail: "7 Pads · Metronome & Loops" },
  { to: "/ukulele", name: "Ukulele", detail: "GCEA Soprano · Strum & Pluck" },
] as const;

const CREATE_LEARN = [
  { to: "/practice", name: "Practice Suite", detail: "Lessons · Challenges · History" },
  { to: "/chords", name: "Chord Playground", detail: "Piano, Guitar & Uke Diagrams" },
  { to: "/jam", name: "Jam Mode", detail: "Backing Grooves & Styles" },
  { to: "/grooves", name: "Groove Generator", detail: "16-Step Drum Sequencer" },
  { to: "/songs", name: "Songbook", detail: "Lyrics · Chords · Auto-Scroll" },
  { to: "/practice/ear", name: "Ear Training", detail: "Pitch & Chord Recognition" },
] as const;

const TUNERS = [
  { to: "/tuners/guitar", name: "Guitar Tuner", detail: "Mic Pitch Detector" },
  { to: "/tuners/ukulele", name: "Ukulele Tuner", detail: "Mic Pitch Detector" },
  { to: "/tuners/drums", name: "Drum Tuner", detail: "Head Pitch & Cents" },
] as const;


function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 space-y-12">
      <section className="hairline pb-10">
        <h1 className="font-display text-6xl uppercase leading-[0.92] tracking-[-0.03em] sm:text-8xl">
          Instru
          <span style={{ color: "var(--signal)" }}>mento</span>
        </h1>
        <p className="label-mono mt-4 text-signal font-bold">
          PLAY → LEARN → PRACTICE → CREATE
        </p>
      </section>

      {/* Play Instruments Section */}
      <section>
        <h2 className="label-mono">Play Instruments</h2>
        <div className="mt-4 grid gap-px border border-panel-edge bg-panel-edge sm:grid-cols-2">
          {INSTRUMENTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-baseline justify-between bg-panel px-5 py-7 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
            >
              <span className="font-display text-3xl uppercase tracking-tight">{item.name}</span>
              <span className="label-mono">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Learn, Practice & Create Section */}
      <section>
        <h2 className="label-mono">Learn, Practice & Create</h2>
        <div className="mt-4 grid gap-px border border-panel-edge bg-panel-edge sm:grid-cols-2 md:grid-cols-3">
          {CREATE_LEARN.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col justify-between bg-panel px-5 py-6 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
            >
              <span className="font-display text-2xl uppercase tracking-tight text-signal">{item.name}</span>
              <span className="label-mono mt-3">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tuners Section */}
      <section>
        <h2 className="label-mono">Tuners & Utilities</h2>
        <div className="mt-4 grid gap-px border border-panel-edge bg-panel-edge sm:grid-cols-2">
          {TUNERS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-baseline justify-between bg-panel px-5 py-7 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
            >
              <span className="font-display text-2xl uppercase tracking-tight">{item.name}</span>
              <span className="label-mono">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="label-mono mt-10">
        Hi! Your friend Ayus made this. Here are your beats - <Link to="/recordings" className="underline text-signal">Recordings</Link>.
      </p>
    </div>
  );
}
