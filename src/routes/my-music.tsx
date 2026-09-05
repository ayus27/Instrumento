import { createFileRoute, Link } from "@tanstack/react-router";
import { Folder, Play, Clock, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { loadRecordings, type SavedRecording } from "@/lib/audio/recorder";

export const Route = createFileRoute("/my-music")({
  head: () => ({
    meta: [
      { title: "My Music — Instrumento" },
      { name: "description", content: "Your studio projects and saved takes." },
    ],
  }),
  component: MyMusicPage,
});

function MyMusicPage() {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);

  useEffect(() => {
    setRecordings(loadRecordings());
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-12">
      <header className="hairline pb-4">
        <h1 className="text-display text-4xl">MY MUSIC</h1>
        <p className="text-technical mt-1">Your Projects and Recordings</p>
      </header>

      {/* Projects Section */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-display text-2xl">Studio Projects</h2>
          <Link to="/create/projects" className="text-sm font-bold text-signal hover:underline">
            VIEW ALL
          </Link>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="studio-panel p-5 group hover:border-signal transition-colors cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-signal scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"></div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-xl">Untitled Project</h3>
              <Folder className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Last edited 2 hrs ago</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music className="w-4 h-4" />
                <span>4 tracks · 120 BPM</span>
              </div>
            </div>
            <Link to="/create" className="text-signal text-sm font-bold hover:underline underline-offset-4">
              OPEN IN STUDIO
            </Link>
          </div>
          
          <Link to="/create" className="studio-panel border-dashed p-5 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-signal/10 text-signal flex items-center justify-center mb-3">
              <span className="text-xl leading-none">+</span>
            </div>
            <p className="font-bold text-sm">New Project</p>
            <p className="text-xs text-muted-foreground mt-1">Start from scratch</p>
          </Link>
        </div>
      </section>

      {/* Legacy Takes / Recordings Section */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-display text-2xl">Instrument Takes</h2>
          <Link to="/recordings" className="text-sm font-bold text-signal hover:underline">
            MANAGE TAKES
          </Link>
        </div>
        
        {recordings.length === 0 ? (
          <div className="studio-panel border-dashed p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Music className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">No recorded takes.</p>
            <p className="text-xs mt-1 opacity-70">Record something on the instrument pages.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {recordings.slice(0, 6).map((rec) => (
              <div key={rec.id} className="studio-panel p-5 group">
                <h3 className="font-display text-lg mb-1">{rec.name}</h3>
                <p className="text-technical text-muted-foreground mb-4">
                  {rec.instrument} · {rec.bpm} BPM · {(rec.duration / 1000).toFixed(1)}s
                </p>
                <button className="flex items-center gap-2 bg-signal/10 text-signal px-3 py-1.5 rounded text-sm font-bold hover:bg-signal/20 transition-colors">
                  <Play className="w-3 h-3" /> PLAY TAKE
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
