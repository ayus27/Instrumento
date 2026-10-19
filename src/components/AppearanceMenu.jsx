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
      className="h-7 w-7 rounded-full border"
      style={{
        backgroundColor: c.swatch,
        borderColor: "var(--ink)",
        borderWidth: value === c.value ? 3 : 1.5,
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
        className="pill bg-canvas px-4 py-1.5 text-sm"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Appearance
      </button>
      {open && (
        <div className="panel absolute right-0 z-50 mt-2 w-64 bg-canvas space-y-4 p-4">
          <Row label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setAppearance({ theme: t.value })}
                aria-pressed={appearance.theme === t.value}
                className={`pill px-4 py-1 text-sm ${appearance.theme === t.value ? "bg-lime text-[color:var(--on-lime)]" : "bg-canvas"}`}
              >
                {t.label}
              </button>
            ))}
          </Row>
          <Row label="Highlight colour">
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
