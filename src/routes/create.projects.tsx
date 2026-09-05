import { createFileRoute, Link } from "@tanstack/react-router";
import { Folder, Clock, Music, Plus } from "lucide-react";

export const Route = createFileRoute("/create/projects")({
  head: () => ({
    meta: [
      { title: "My Projects — Instrumento" },
      { name: "description", content: "Your saved Studio projects." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-4xl">MY PROJECTS</h1>
          <p className="text-technical mt-1">Multi-track Studio Projects</p>
        </div>

        <Link
          to="/create"
          className="flex items-center gap-2 bg-signal px-4 py-2 text-sm font-bold text-primary-foreground rounded-sm hover:bg-signal-dim transition-colors"
        >
          <Plus className="h-4 w-4" /> NEW PROJECT
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Placeholder Project Card */}
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

          <Link
            to="/create"
            className="text-signal text-sm font-bold hover:underline underline-offset-4"
          >
            OPEN IN STUDIO
          </Link>
        </div>

        {/* Empty state for demonstration */}
        <div className="studio-panel border-dashed p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
          <Folder className="w-8 h-8 mb-3 opacity-50" />
          <p className="text-sm">No other projects found.</p>
          <p className="text-xs mt-1 opacity-70">Saved projects will appear here.</p>
        </div>
      </div>
    </div>
  );
}
