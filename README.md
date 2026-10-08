# Instrumento

A browser-based virtual instrument platform — play piano, guitar, drums, and ukulele, tune your instruments, learn songs, generate grooves, and record your own multi-track sessions. No installation, no plugins: everything runs in your browser.

## Features

- **Instruments** — Piano, Guitar, Ukulele, and a 7-piece Drum Kit, all playable with mouse, touch, or your computer keyboard
- **Tuners** — Guitar/ukulele chromatic tuner and a drum-head tuner, using your microphone with YIN-style pitch detection
- **Practice** — Guided "Teach Me" lessons for piano and drums with live feedback
- **Chords** — Chord playground with diagrams and playback
- **Songs** — Multilingual song library (English, Nepali, Hindi) with chord-over-lyric view, transposition, and auto-scroll
- **Groove Generator** — 16-step drum pattern builder with recording and export
- **Jam Mode** — Play along with chord-progression backing tracks
- **Studio** — Multi-track recorder: record instruments, add grooves, import audio files, and record from your microphone
- **Recordings** — Capture and replay your performances
- **Accounts** — Sign up / log in with saved appearance preferences (light & dark mode, accent colors)
- **MCP Server** — Agent integrations available at `/mcp` (OAuth-protected)

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, SSR) + Vite
- **Audio:** [Tone.js](https://tonejs.github.io/) + Web Audio API
- **Styling:** Tailwind CSS v4 + shadcn-style components
- **Database:** Neon PostgreSQL (`@neondatabase/serverless`) for users, sessions, and preferences
- **Auth:** Custom session auth with bcrypt password hashing and HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh/))

### Installation

```bash
git clone <your-repo-url>
cd instrumento
npm install
```

### Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |

### Run

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

### Build for production

```bash
npm run build
npm start
```

## Project Structure

```text
src/
├── routes/            # Pages (TanStack Router file-based routing)
├── components/        # UI, instrument, tuner, drum, song components
├── hooks/             # useInstrument, useTuner, usePracticeSession, ...
├── lib/
│   ├── audio/         # Tone.js engine, instruments, pitch detection, recorders
│   ├── songs/         # Song catalog, transposition, chord data
│   ├── drums/         # Drum key mapping
│   ├── practice/      # Practice engine & lessons
│   └── mcp/           # MCP server tools
└── styles.css         # Design tokens (light/dark themes)
```

## Deployment

The app deploys on [Lovable](https://lovable.dev) and can also be self-hosted (e.g. Vercel). Static assets are bundled locally, so no Lovable-specific URLs are required at runtime.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
