import { createContext, useContext, useState, type ReactNode } from "react";
import type { StudioProject, StudioTrack, StudioClip } from "../types/studio";

interface StudioProjectContextType {
  project: StudioProject;
  addTrack: (track: StudioTrack) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<StudioTrack>) => void;
  addClip: (clip: StudioClip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<StudioClip>) => void;
}

const StudioProjectContext = createContext<StudioProjectContextType | null>(null);

export function StudioProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<StudioProject>({
    id: "new-project",
    name: "Untitled Project",
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [],
    clips: [],
  });

  const addTrack = (track: StudioTrack) => {
    setProject((prev) => ({ ...prev, tracks: [...prev.tracks, track] }));
  };

  const removeTrack = (trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
      clips: prev.clips.filter((c) => c.trackId !== trackId),
    }));
  };

  const updateTrack = (trackId: string, updates: Partial<StudioTrack>) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
    }));
  };

  const addClip = (clip: StudioClip) => {
    setProject((prev) => ({ ...prev, clips: [...prev.clips, clip] }));
  };

  const removeClip = (clipId: string) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== clipId),
    }));
  };

  const updateClip = (clipId: string, updates: Partial<StudioClip>) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
    }));
  };

  return (
    <StudioProjectContext.Provider
      value={{ project, addTrack, removeTrack, updateTrack, addClip, removeClip, updateClip }}
    >
      {children}
    </StudioProjectContext.Provider>
  );
}

export function useStudioProject() {
  const context = useContext(StudioProjectContext);
  if (!context) {
    throw new Error("useStudioProject must be used within a StudioProjectProvider");
  }
  return context;
}
