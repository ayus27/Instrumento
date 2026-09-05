import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Square, Circle, Save, RotateCcw, RotateCw, Plus } from "lucide-react";
import { ProjectProvider, useProject } from "../lib/studio/project-state";
import { TrackHeader } from "../components/studio/TrackHeader";
import { Timeline } from "../components/studio/Timeline";

export const Route = createFileRoute("/create/")({
  head: () => ({
    meta: [
      { title: "Studio — Instrumento" },
      { name: "description", content: "Browser-based multi-track DAW." },
    ],
  }),
  component: () => (
    <ProjectProvider>
      <CreateStudio />
    </ProjectProvider>
  ),
});

function CreateStudio() {
  const { project, updateProject, addTrack } = useProject();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-65px)] w-full flex-col studio-bg">
      {/* Top Header / Transport */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-studio-border px-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={project.name}
            onChange={(e) => updateProject({ name: e.target.value })}
            className="bg-transparent text-display text-lg focus:outline-none focus:ring-1 focus:ring-signal rounded px-1"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-technical">Tempo</span>
            <input
              type="number"
              value={project.bpm}
              onChange={(e) => updateProject({ bpm: Number(e.target.value) })}
              className="w-16 studio-panel px-2 py-1 text-center font-mono text-sm"
              min={40}
              max={240}
            />
          </div>

          <div className="flex items-center gap-1 studio-panel p-1">
            <button 
              className="rounded p-1.5 hover:bg-accent" 
              onClick={async () => {
                const engine = await import("../lib/audio/engine").then(m => m.getEngine());
                await engine.ensureReady();
                if (isPlaying) {
                  engine.transport?.stop();
                  setIsPlaying(false);
                } else {
                  engine.transport?.start();
                  setIsPlaying(true);
                }
              }}
            >
              {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              className={`rounded p-1.5 ${isRecording ? "text-destructive bg-destructive/10" : "hover:bg-accent"}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Circle className={`h-4 w-4 ${isRecording ? "fill-destructive" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 studio-panel px-3 py-1.5 text-xs hover:bg-accent"
              onClick={() => import("../lib/audio/engine").then(m => m.getEngine().seekTo(0))}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 studio-panel px-3 py-1.5 text-xs hover:bg-accent">
              <RotateCw className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 bg-signal px-4 py-1.5 text-xs font-bold text-primary-foreground rounded-sm hover:opacity-90">
              <Save className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Track Headers */}
        <div className="hidden md:flex w-64 shrink-0 flex-col border-r border-studio-border studio-surface-elevated">
          <div className="p-3 border-b border-studio-border">
            <button 
              className="w-full flex items-center justify-center gap-2 studio-panel py-2 text-xs hover:bg-accent transition-colors font-bold text-signal"
              onClick={() => addTrack({ name: "New Track", type: "instrument", volume: 0.8, pan: 0, mute: false, solo: false })}
            >
              <Plus className="h-3 w-3" /> ADD TRACK
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {project.tracks.map((track) => (
              <TrackHeader 
                key={track.id} 
                track={track} 
                isActive={activeTrackId === track.id}
                onSelect={() => setActiveTrackId(track.id)}
              />
            ))}
            {project.tracks.length === 0 && (
               <div className="p-6 text-center text-sm text-muted-foreground">
                 Click Add Track to start building your project.
               </div>
            )}
          </div>
        </div>

        {/* Timeline Area */}
        <Timeline isPlaying={isPlaying} />
      </div>

      {/* Bottom Panel (Mixer / Editor) */}
      <div className="h-48 shrink-0 border-t border-studio-border studio-surface-elevated p-4">
        <p className="text-technical">Mixer & Device Controls</p>
        <p className="text-sm text-muted-foreground mt-4">
          {activeTrackId ? `Editing track ${project.tracks.find(t => t.id === activeTrackId)?.name}` : "Select a track to edit its parameters."}
        </p>
      </div>
    </div>
  );
}
