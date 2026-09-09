import type { InstrumentId } from "@/lib/audio/engine";

export type TrackType = "instrument" | "drums" | "audio";

export interface MidiNote {
  id: string;
  midi: number;
  velocity: number;
  startTick: number;
  durationTicks: number;
}

export interface StudioClip {
  id: string;
  trackId: string;
  name: string;
  startTick: number;
  durationTicks: number;
  
  // For MIDI/Instrument tracks
  notes?: MidiNote[];
  
  // For Audio tracks
  audioUrl?: string;
  audioBuffer?: AudioBuffer;
}

export interface StudioTrack {
  id: string;
  name: string;
  type: TrackType;
  instrumentId?: InstrumentId;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  color: string;
}

export interface StudioProject {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number]; // e.g. [4, 4]
  tracks: StudioTrack[];
  clips: StudioClip[];
}
