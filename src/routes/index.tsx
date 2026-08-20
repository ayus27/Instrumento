import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instrumento — Playable Browser Instruments" },
      {
        name: "description",
        content:
          "Instrumento is a browser instrument rig: piano, guitar, drums and ukulele you can play with mouse or keyboard, plus metronome, recording and microphone tuners.",
      },
      { property: "og:title", content: "Instrumento — Playable Browser Instruments" },
      {
        property: "og:description",
        content:
          "All your Instruments are right here. Start Jamming!",
      },
    ],
  }),
  component: Index,
});

const INSTRUMENTS = [
  { to: "/piano", name: "Piano", detail: "" },
  { to: "/guitar", name: "Guitar", detail: "" },
  { to: "/drums", name: "Drums", detail: "" },
  { to: "/ukulele", name: "Ukulele", detail: "" },
] as const;

const TUNERS = [
  { to: "/tuners/guitar", name: "Guitar Tuner", detail: "" },
  { to: "/tuners/ukulele", name: "Ukulele Tuner", detail: "" },
] as const;

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <section className="hairline pb-10">
        <h1 className="font-display text-6xl uppercase leading-[0.92] tracking-[-0.03em] sm:text-8xl">
          Instru
          <span style={{ color: "var(--signal)" }}>mento</span>
        </h1>
        <p className="label-mono mt-4">Four instruments · Two tuners · Live in your browser</p>
      </section>

      <section className="pt-8">
        <h2 className="label-mono">Instruments</h2>
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

      <section className="pt-10">
        <h2 className="label-mono">Tuners</h2>
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
        Saved takes live under <Link to="/recordings" className="underline">Recordings</Link>.
      </p>
    </div>
  );
}
