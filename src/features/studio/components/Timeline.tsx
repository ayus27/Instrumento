import { useStudioProject } from "../hooks/useStudioProject";
import { useTransport } from "../hooks/useTransport";
import { PPQ, ticksToPixels } from "../lib/timelineMath";

export function Timeline() {
  const { project } = useStudioProject();
  const { ticks } = useTransport();
  
  // Hardcode zoom for now
  const pixelsPerBeat = 40;
  
  return (
    <div className="flex h-full flex-col overflow-auto bg-studio-surface relative">
      {/* Ruler */}
      <div className="sticky top-0 z-10 flex h-8 items-end border-b border-border bg-studio-surface-elevated/80 backdrop-blur">
        {/* Placeholder for ruler marks */}
        <div className="w-full text-xs text-muted-foreground pl-4">
          Ruler
        </div>
      </div>
      
      {/* Playhead */}
      <div 
        className="absolute bottom-0 top-0 z-20 w-px bg-studio-playhead shadow-[0_0_8px_rgba(255,255,255,0.5)] pointer-events-none"
        style={{ left: `${Math.max(0, ticksToPixels(ticks, pixelsPerBeat))}px` }}
      >
        <div className="absolute -left-1.5 top-0 h-3 w-3 rotate-45 bg-studio-playhead" />
      </div>
      
      {/* Tracks Area */}
      <div className="flex-1">
        {project.tracks.map((track) => (
          <div key={track.id} className="flex h-24 border-b border-border/50 bg-studio-track">
            {/* Track Lane Placeholder */}
            <div className="flex-1 relative">
              {project.clips.filter(c => c.trackId === track.id).map(clip => (
                <div 
                  key={clip.id} 
                  className="absolute top-1 bottom-1 rounded border border-border bg-studio-clip/50"
                  style={{
                    left: `${ticksToPixels(clip.startTick, pixelsPerBeat)}px`,
                    width: `${ticksToPixels(clip.durationTicks, pixelsPerBeat)}px`
                  }}
                >
                  <div className="px-2 py-1 text-xs font-medium">{clip.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
