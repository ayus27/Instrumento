import { useEffect, useRef, useState } from "react";
import { COLORS, THEMES, useAppearance } from "@/lib/appearance";

function Row({ label, children }) {
  return (
    <div className="space-y-1.5">
      <div className="label-mono">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Swatches({ value, onChange }) {
  return COLORS.map((c) => (
    <button
      key={c.value}
      type="button"
      title={c.label}
      aria-label={c.label}
      aria-pressed={value === c.value}
      onClick={() => onChange(c.value)}
      className="h-6 w-6 border transition-transform hover:scale-105"
      style={{
        backgroundColor: c.swatch,
        borderColor: value === c.value ? "var(--foreground)" : "var(--panel-edge)",
        borderWidth: value === c.value ? 2 : 1,
      }}
    />
  ));
}

export function AppearanceMenu() {
  const { appearance, setAppearance } = useAppearance();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="label-mono border border-panel-edge px-2 py-1 transition-colors hover:text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Appearance
      </button>
      {open && (
        <div className="panel absolute right-0 z-50 mt-2 w-64 space-y-4 p-4">
          <Row label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setAppearance({ theme: t.value })}
                aria-pressed={appearance.theme === t.value}
                className="label-mono border px-2 py-1 transition-colors hover:text-foreground"
                style={{
                  borderColor: appearance.theme === t.value ? "var(--signal)" : "var(--panel-edge)",
                  color: appearance.theme === t.value ? "var(--signal)" : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </Row>
          <Row label="Primary color">
            <Swatches
              value={appearance.primary_color}
              onChange={(v) => setAppearance({ primary_color: v })}
            />
          </Row>
          <Row label="Accent color">
            <Swatches
              value={appearance.accent_color}
              onChange={(v) => setAppearance({ accent_color: v })}
            />
          </Row>
        </div>
      )}
    </div>
  );
}
