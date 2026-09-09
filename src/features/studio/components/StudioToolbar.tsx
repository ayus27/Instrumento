import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStudioProject } from "../hooks/useStudioProject";
import { useTransport } from "../hooks/useTransport";
import { Play, Square, Circle, Rewind, Settings, Download } from "lucide-react";
import logo from "@/assets/instrumento-wordmark.png";

export function StudioToolbar() {
  const { project } = useStudioProject();
  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-studio-surface px-4">
      <div className="flex items-center gap-4">
        <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
          <img src={logo} alt="Instrumento" className="logo-mark h-6 w-auto" />
        </Link>
        <div className="h-4 w-px bg-border" />
        <input 
          type="text" 
          value={project.name}
          readOnly // Temporarily readonly until we add rename logic
          className="bg-transparent font-medium focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}

export function TransportControls() {
  const { isPlaying, play, pause, stop, ticks, bpm, setBpm } = useTransport();
  
  return (
    <div className="flex h-14 items-center justify-center gap-6 border-b border-border bg-studio-surface-elevated">
      {/* Time display */}
      <div className="flex flex-col items-center justify-center rounded bg-black/40 px-4 py-1 font-mono text-sm shadow-inner min-w-[100px]">
        <div className="text-muted-foreground text-[10px]">TIME</div>
        <div>{Math.floor(ticks)}</div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={stop}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent text-foreground transition-colors"
        >
          <Rewind className="h-5 w-5" />
        </button>
        
        {isPlaying ? (
          <button 
            onClick={pause}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent text-foreground transition-colors"
          >
            <Square className="h-5 w-5" fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={play}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent text-foreground transition-colors"
          >
            <Play className="h-5 w-5" fill="currentColor" />
          </button>
        )}
        
        <button 
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent text-red-500 transition-colors"
        >
          <Circle className="h-5 w-5" fill="currentColor" />
        </button>
      </div>
      
      {/* Tempo/Metronome */}
      <div className="flex items-center gap-4 rounded bg-black/40 px-4 py-1.5 shadow-inner">
        <div className="flex flex-col items-center">
          <div className="text-muted-foreground text-[10px]">BPM</div>
          <input 
            type="number" 
            value={Math.round(bpm)}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-12 bg-transparent text-center font-mono text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
