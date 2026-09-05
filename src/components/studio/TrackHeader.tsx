import { Track as TrackType, useProject } from "../../lib/studio/project-state";
import { Mic, Music, Volume2, Settings2, Trash2 } from "lucide-react";

interface TrackHeaderProps {
  track: TrackType;
  isActive: boolean;
  onSelect: () => void;
}

export function TrackHeader({ track, isActive, onSelect }: TrackHeaderProps) {
  const { updateTrack, removeTrack } = useProject();

  const toggleMute = () => updateTrack(track.id, { mute: !track.mute });
  const toggleSolo = () => updateTrack(track.id, { solo: !track.solo });

  return (
    <div 
      className={`h-24 border-b border-studio-border p-3 flex flex-col justify-center cursor-pointer transition-colors ${isActive ? "bg-accent/20" : "hover:bg-accent/10"}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            {track.type === "audio" ? <Mic className="w-3 h-3" /> : <Music className="w-3 h-3" />}
            {track.name}
          </p>
          <p className="text-technical mt-1 opacity-70">{track.type}</p>
        </div>
        <button 
          className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button 
          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${track.mute ? "bg-destructive text-destructive-foreground" : "bg-muted hover:bg-muted-foreground/30"}`}
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
        >
          M
        </button>
        <button 
          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${track.solo ? "bg-[#e5a00d] text-primary-foreground" : "bg-muted hover:bg-muted-foreground/30"}`}
          onClick={(e) => { e.stopPropagation(); toggleSolo(); }}
        >
          S
        </button>
        <div className="flex items-center gap-1 flex-1 px-2">
          <Volume2 className="w-3 h-3 text-muted-foreground" />
          <input 
            type="range" 
            min={0} max={1} step={0.01} 
            value={track.volume} 
            onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
            className="w-full h-1 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
