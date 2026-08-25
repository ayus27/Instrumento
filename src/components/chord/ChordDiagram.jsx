import React from "react";

export function ChordDiagram({ chord, instrumentType = "guitar", className = "" }) {
  const isUkulele = instrumentType === "ukulele";
  const numStrings = isUkulele ? 4 : 6;
  const numFrets = 5;
  const stringNames = isUkulele ? ["G", "C", "E", "A"] : ["E", "A", "D", "G", "B", "E"];
  const fingering = isUkulele ? chord.ukuleleFingering : chord.guitarFingering;

  if (!fingering) return null;

  const width = isUkulele ? 160 : 200;
  const height = 220;
  const paddingX = 35;
  const paddingTop = 45;
  const paddingBottom = 30;

  const gridWidth = width - paddingX * 2;
  const gridHeight = height - paddingTop - paddingBottom;
  const stringSpacing = gridWidth / (numStrings - 1);
  const fretSpacing = gridHeight / numFrets;

  return (
    <div className={`panel p-4 inline-block text-center ${className}`}>
      <p className="label-mono mb-1">{instrumentType.toUpperCase()} CHORD</p>
      <h3 className="font-display text-2xl uppercase tracking-tight text-foreground">{chord.fullName}</h3>

      <svg width={width} height={height} className="mx-auto mt-2">
        <line
          x1={paddingX}
          y1={paddingTop}
          x2={width - paddingX}
          y2={paddingTop}
          stroke="var(--signal)"
          strokeWidth="5"
        />

        {Array.from({ length: numFrets + 1 }).map((_, i) => {
          if (i === 0) return null;
          const y = paddingTop + i * fretSpacing;
          return (
            <line
              key={`fret-${i}`}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--panel-edge)"
              strokeWidth="1.5"
            />
          );
        })}

        {Array.from({ length: numStrings }).map((_, i) => {
          const x = paddingX + i * stringSpacing;
          return (
            <g key={`string-${i}`}>
              <line
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + gridHeight}
                stroke="oklch(0.55 0.01 60)"
                strokeWidth={isUkulele ? "1.5" : `${2.5 - i * 0.3}`}
              />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                className="font-mono text-[10px]"
              >
                {stringNames[i]}
              </text>
            </g>
          );
        })}

        {fingering.frets.map((fretVal, stringIdx) => {
          const x = paddingX + stringIdx * stringSpacing;

          if (fretVal === "x") {
            return (
              <text
                key={`marker-${stringIdx}`}
                x={x}
                y={paddingTop - 12}
                textAnchor="middle"
                fill="var(--destructive)"
                className="font-mono text-sm font-bold"
              >
                ✕
              </text>
            );
          }

          if (fretVal === 0) {
            return (
              <circle
                key={`marker-${stringIdx}`}
                cx={x}
                cy={paddingTop - 15}
                r="4.5"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="1.5"
              />
            );
          }

          const y = paddingTop + (fretVal - 0.5) * fretSpacing;
          const fingerNum = fingering.fingers ? fingering.fingers[stringIdx] : null;

          return (
            <g key={`dot-${stringIdx}`}>
              <circle cx={x} cy={y} r="10" fill="var(--signal)" />
              {fingerNum > 0 && (
                <text
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fill="var(--primary-foreground)"
                  className="font-mono text-[11px] font-bold"
                >
                  {fingerNum}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
