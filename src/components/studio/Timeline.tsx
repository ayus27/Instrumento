import { useProject } from "../../lib/studio/project-state";
import { Playhead } from "./Playhead";

export function Timeline({ isPlaying = false }: { isPlaying?: boolean }) {
  const { project } = useProject();
  const measures = 32; // Default visible length
  const beatsPerMeasure = 4;
  const pixelsPerBeat = 40; // Zoom level

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-studio-surface relative">
      {/* Timeline Header (Ruler) */}
      <div className="h-8 border-b border-studio-border flex items-end sticky top-0 z-20 bg-studio-surface">
        <div 
          className="flex h-4 relative" 
          style={{ width: measures * beatsPerMeasure * pixelsPerBeat }}
        >
          <Playhead pixelsPerBeat={pixelsPerBeat} isPlaying={isPlaying} />
          
          {Array.from({ length: measures }).map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 border-l border-studio-border/50 relative"
              style={{ width: beatsPerMeasure * pixelsPerBeat }}
            >
              <span className="text-technical px-1 text-[9px] absolute -top-4 left-0">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Track Lanes */}
      <div className="flex-1 overflow-auto relative">
        <div 
          className="relative min-h-full"
          style={{ width: measures * beatsPerMeasure * pixelsPerBeat }}
        >
          {/* Vertical grid lines */}
          <div className="absolute inset-0 pointer-events-none flex">
             {Array.from({ length: measures * beatsPerMeasure }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-shrink-0 border-l ${i % 4 === 0 ? "border-studio-border/30" : "border-studio-border/10"}`}
                  style={{ width: pixelsPerBeat }}
                />
             ))}
          </div>

          {/* Track Rows */}
          {project.tracks.map((track) => (
            <div 
              key={track.id} 
              className="h-24 border-b border-studio-border/30 bg-studio-track relative group"
            >
              {/* Clips for this track */}
              {project.clips
                .filter((clip) => clip.trackId === track.id)
                .map((clip) => (
                  <div
                    key={clip.id}
                    className="absolute top-1 bottom-1 rounded-sm bg-studio-clip border border-signal/50 cursor-grab active:cursor-grabbing hover:border-signal transition-colors flex flex-col overflow-hidden"
                    style={{
                      left: clip.startBeat * pixelsPerBeat,
                      width: clip.durationBeats * pixelsPerBeat,
                    }}
                  >
                     <div className="h-4 bg-signal/20 border-b border-signal/30 text-[9px] font-mono px-1 flex items-center">
                        Clip
                     </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
