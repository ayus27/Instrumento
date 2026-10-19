import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Circle } from "lucide-react";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Instrumento — Play, learn and create music" },
      {
        name: "description",
        content:
          "Play piano, guitar, drums & ukulele. Practice lessons, challenges & ear training. Create grooves, beats & songs. Jam with backing tracks. Tune instruments.",
      },
      { property: "og:title", content: "Instrumento — Play, learn and create music" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Piano, guitar, drums, ukulele, lessons and a studio — in your browser.",
      },
    ],
  }),
  component: Index,
});

const INSTRUMENTS = [
  { to: "/piano", name: "Piano", detail: "Keyboard" },
  { to: "/guitar", name: "Guitar", detail: "Acoustic & Electric" },
  { to: "/drums", name: "Drums", detail: "7 Pads" },
  { to: "/ukulele", name: "Ukulele", detail: "GCEA Soprano" },
] as const;

const CREATE_LEARN = [
  { to: "/practice", name: "Practice", detail: "Lessons · Challenges" },
  { to: "/chords", name: "Chord Playground", detail: "Piano, Guitar & Uke Diagrams" },
  { to: "/jam", name: "Jam Mode", detail: "Backing Grooves & Styles" },
  { to: "/grooves", name: "Groove Generator", detail: "16-Step Drum Sequencer" },
  { to: "/songs", name: "Songbook", detail: "Lyrics · Chords" },
  { to: "/practice/ear", name: "Ear Training", detail: "Pitch & Chord Recognition" },
] as const;

const TUNERS = [
  { to: "/tuners/guitar", name: "Guitar Tuner", detail: "Mic Pitch Detector" },
  { to: "/tuners/ukulele", name: "Ukulele Tuner", detail: "Mic Pitch Detector" },
  { to: "/tuners/drums", name: "Drum Tuner", detail: "Head Pitch & Cents" },
] as const;


function Tile({ to, className = "", children }: { to: string; className?: string; children: React.ReactNode }) {
  return (
    <Link to={to} className={`tile flex flex-col justify-between p-5 focus-visible:outline-2 focus-visible:outline-ink ${className}`}>
      {children}
    </Link>
  );
}

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="order-2 grid grid-cols-2 gap-3 lg:order-1">
          <Tile to="/piano" className="bg-canvas">
            <div className="flex items-start justify-between">
              <span className="text-4xl font-medium tabular-nums">4+</span>
              <span className="pill grid h-10 w-10 place-items-center bg-lime text-[color:var(--on-lime)]"><ArrowUpRight className="h-5 w-5" /></span>
            </div>
            <span className="mt-6 text-sm">Instruments to play</span>
          </Tile>
          <Tile to="/practice" className="-ml-2 mt-6">
            <span className="text-2xl font-medium">Practice</span>
            <span className="mt-3 text-sm text-muted-foreground">Step-by-step lessons for piano and drums</span>
          </Tile>
          {INSTRUMENTS.map((item, i) => (
            <Tile key={item.to} to={item.to} className={i % 2 ? "-ml-2 bg-canvas" : ""}>
              <span className="text-2xl font-medium">{item.name}</span>
              <span className="mt-6 text-sm text-muted-foreground">{item.detail}</span>
            </Tile>
          ))}
          <Tile to="/create" className="col-span-2 bg-lime text-[color:var(--on-lime)]">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-medium">Studio</span>
              <span className="pill bg-canvas px-3 py-0.5 text-xs">new</span>
            </div>
            <span className="mt-3 text-sm">Record instruments, add grooves, import audio and use your mic.</span>
          </Tile>
        </div>

        <div className="order-1 lg:order-2">
          <h1 className="text-5xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            Play, learn and create music in your browser
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground">
            Real instruments, lessons, songs, tuners and a multi-track studio. Nothing to install.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Link to="/create" className="pill inline-flex items-center gap-3 bg-ink px-7 py-3 text-sm text-canvas">
              Start creating <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/piano" className="pill inline-flex items-center gap-3 bg-page py-2 pl-6 pr-2 text-sm">
              Play an instrument
              <span className="pill grid h-8 w-8 place-items-center bg-canvas"><Circle className="h-3 w-3 fill-ink" /></span>
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { n: "6", t: "Learning tools — lessons, chords, songs, ear training and more" },
              { n: "3", t: "Microphone tuners for guitar, ukulele and drums" },
            ].map((s) => (
              <div key={s.t} className="tile p-5">
                <div className="flex items-center gap-3"><span className="diamond" /><span className="h-px flex-1 bg-ink" /></div>
                <div className="mt-4 text-4xl font-medium tabular-nums">{s.n}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-medium">Learn, practice &amp; create</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[...CREATE_LEARN, ...TUNERS].map((item) => (
            <Tile key={item.to} to={item.to}>
              <span className="flex items-center gap-2 text-xl font-medium"><span className="diamond" />{item.name}</span>
              <span className="mt-4 text-sm text-muted-foreground">{item.detail}</span>
            </Tile>
          ))}
        </div>
      </section>
    </div>
  );
}
