import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/instrumento-wordmark.png.asset.json";


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
        <p className="mt-8 max-w-2xl text-display text-4xl leading-[1.1] sm:text-6xl text-foreground">
          PLAY. CREATE. LEARN.
        </p>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Real instruments, beats, songs and music creation — directly in your browser.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/create"
            className="rounded-full bg-signal px-7 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-signal-dim hover:scale-[1.02]"
          >
            START CREATING
          </Link>
          <Link
            to="/piano"
            className="rounded-full border border-panel-edge px-7 py-3 text-sm font-bold transition-all hover:bg-accent hover:scale-[1.02]"
          >
            PLAY AN INSTRUMENT
          </Link>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-display text-2xl sm:text-3xl">Instruments</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {INSTRUMENTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card group relative flex items-center justify-between overflow-hidden px-6 py-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span className="text-display text-2xl sm:text-3xl relative z-10 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-signal">
                {item.name}
              </span>
              <span className="text-technical text-right relative z-10 transition-opacity duration-200 group-hover:opacity-100 opacity-60">
                {item.detail}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-display text-2xl sm:text-3xl">
          Learn, practice &amp; create
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {CREATE_LEARN.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card group flex flex-col justify-between px-6 py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span
                className="text-display text-xl transition-transform duration-200 group-hover:-translate-y-1"
                style={{ color: "var(--signal)" }}
              >
                {item.name}
              </span>
              <span className="text-technical mt-4">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-display text-2xl sm:text-3xl">Tools</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TUNERS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="soft-card group flex flex-col justify-between px-6 py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span className="text-display text-xl transition-transform duration-200 group-hover:-translate-y-1">{item.name}</span>
              <span className="text-technical mt-4">{item.detail}</span>
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

