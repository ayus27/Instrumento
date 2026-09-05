import { useState } from "react";
import { useInstrument } from "../../hooks/useInstrument";

const LANES = [
  { id: "kick", name: "KICK" },
  { id: "snare", name: "SNARE" },
  { id: "hihat", name: "HAT" },
  { id: "openhat", name: "O.HAT" },
  { id: "tom", name: "TOM" },
  { id: "crash", name: "CRASH" },
];

export function BeatLab({ steps = 16, currentStep = -1 }: { steps?: number, currentStep?: number }) {
  const [grid, setGrid] = useState<Record<string, number[]>>(() => {
    const init: Record<string, number[]> = {};
    LANES.forEach(l => init[l.id] = Array(steps).fill(0));
    return init;
  });
  
  const drumInst = useInstrument("drums");

  const toggleStep = async (laneId: string, stepIdx: number) => {
    await drumInst.ensure();
    drumInst.hit(laneId);
    setGrid(prev => {
      const copy = { ...prev };
      copy[laneId] = [...copy[laneId]];
      copy[laneId][stepIdx] = copy[laneId][stepIdx] ? 0 : 1;
      return copy;
    });
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      {LANES.map(lane => (
        <div key={lane.id} className="flex items-center gap-4">
          <div className="w-16 shrink-0 text-technical text-right">{lane.name}</div>
          <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))` }}>
            {grid[lane.id].map((active, stepIdx) => {
              const isCurrent = stepIdx === currentStep;
              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => toggleStep(lane.id, stepIdx)}
                  className={`
                    h-10 rounded-sm border transition-all duration-75 
                    ${active ? "bg-signal border-signal" : "bg-panel border-panel-edge hover:bg-accent"} 
                    ${isCurrent ? "ring-2 ring-foreground" : ""}
                    ${stepIdx % 4 === 0 && !active ? "border-muted-foreground/30" : ""}
                  `}
                />
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Step Markers */}
      <div className="flex items-center gap-4 pt-2">
        <div className="w-16 shrink-0" />
        <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))` }}>
           {Array.from({ length: steps }).map((_, i) => (
             <div key={i} className={`text-technical text-center ${i === currentStep ? "text-signal" : "opacity-30"}`}>
               {(i % 4 === 0) ? (i / 4) + 1 : "·"}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
