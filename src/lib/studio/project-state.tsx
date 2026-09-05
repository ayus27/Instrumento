import { createContext, useContext, useState, ReactNode } from "react";

export type TrackType = "instrument" | "drums" | "midi" | "audio";

export interface Clip {
  id: string;
  trackId: string;
  startBeat: number;
  durationBeats: number;
  audioUrl?: string; // for audio clips
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  instrumentId?: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

export interface ProjectState {
  id: string;
  name: string;
  bpm: number;
  tracks: Track[];
  clips: Clip[];
  loopRegion: { start: number; end: number } | null;
}

interface ProjectContextType {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
  addTrack: (track: Omit<Track, "id">) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  removeTrack: (id: string) => void;
  addClip: (clip: Omit<Clip, "id">) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  removeClip: (id: string) => void;
}

const defaultProject: ProjectState = {
  id: "temp-123",
  name: "Untitled Project",
  bpm: 120,
  tracks: [],
  clips: [],
  loopRegion: null,
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectState>(defaultProject);

  const updateProject = (updates: Partial<ProjectState>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  };

  const addTrack = (track: Omit<Track, "id">) => {
    const newTrack: Track = { ...track, id: Math.random().toString(36).substring(7) };
    setProject((prev) => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const removeTrack = (id: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== id),
      clips: prev.clips.filter((c) => c.trackId !== id),
    }));
  };

  const addClip = (clip: Omit<Clip, "id">) => {
    const newClip: Clip = { ...clip, id: Math.random().toString(36).substring(7) };
    setProject((prev) => ({ ...prev, clips: [...prev.clips, newClip] }));
  };

  const updateClip = (id: string, updates: Partial<Clip>) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const removeClip = (id: string) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== id),
    }));
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        updateProject,
        addTrack,
        updateTrack,
        removeTrack,
        addClip,
        updateClip,
        removeClip,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
