export function PitchIndicator({ cents, active }) {
  const clamped = Math.max(-50, Math.min(50, cents ?? 0));
  const inTune = active && Math.abs(clamped) < 5;
  const color = !active
    ? "var(--muted-foreground)"
    : inTune
      ? "var(--intune)"
      : clamped < 0
        ? "var(--flat)"
        : "var(--sharp)";

  return (
    <div className="space-y-2">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Low</span>
        <span style={{ color }}>{active ? (inTune ? "In tune" : clamped < 0 ? "Flat" : "Sharp") : "—"}</span>
        <span>High</span>
      </div>
      <div className="relative h-8 border" style={{ borderColor: "var(--panel-edge)" }}>
        <div
          className="absolute inset-y-0 left-1/2 w-px"
          style={{ backgroundColor: "var(--panel-edge)" }}
        />
        <div
          className="absolute top-1 h-6 w-1 transition-[left] duration-75"
          style={{ left: `calc(${50 + clamped}% - 2px)`, backgroundColor: color }}
        />
      </div>
      <p className="text-center font-mono text-xs" style={{ color }}>
        {active ? `${clamped > 0 ? "+" : ""}${clamped.toFixed(1)} cents` : "—"}
      </p>
    </div>
  );
}
