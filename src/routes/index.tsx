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
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 sm:pt-20">
      <section className="flex flex-col items-center text-center">
        <img
          src={logo.url}
          alt="Instrumento"
          className="logo-mark h-16 w-auto sm:h-24"
          width={481}
          height={160}
        />
        <h1 className="sr-only">Instrumento</h1>
        <p className="mt-8 max-w-2xl font-display text-3xl leading-[1.1] tracking-[-0.03em] sm:text-5xl">
          Play, learn and record{" "}
          <span style={{ color: "var(--signal)" }}>real instruments</span> right in your browser.
        </p>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Piano, guitar, drums and ukulele — with lessons, chords, jam tracks, a songbook and
          precision tuners. No downloads, no setup.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/piano"
            className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start playing
          </Link>
          <Link
            to="/practice"
            className="rounded-full border border-panel-edge px-7 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            Take a lesson
          </Link>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="font-display text-2xl tracking-[-0.03em] sm:text-3xl">Instruments</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {INSTRUMENTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card flex items-baseline justify-between px-6 py-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span className="font-display text-2xl tracking-[-0.02em] sm:text-3xl">
                {item.name}
              </span>
              <span className="label-mono text-right">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl tracking-[-0.03em] sm:text-3xl">
          Learn, practice &amp; create
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {CREATE_LEARN.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card flex flex-col justify-between px-6 py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span
                className="font-display text-xl tracking-[-0.02em]"
                style={{ color: "var(--signal)" }}
              >
                {item.name}
              </span>
              <span className="label-mono mt-4">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl tracking-[-0.03em] sm:text-3xl">Tuners</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TUNERS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card flex flex-col justify-between px-6 py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span className="font-display text-xl tracking-[-0.02em]">{item.name}</span>
              <span className="label-mono mt-4">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-20 text-center text-sm text-muted-foreground">
        Made by your friend Ayus. Your takes live in{" "}
        <Link to="/recordings" className="text-signal underline underline-offset-4">
          Recordings
        </Link>
        .
      </p>
    </div>
  );
}

