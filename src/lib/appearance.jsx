import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEMES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export const COLORS = [
  { value: "amber", label: "Amber", swatch: "oklch(0.76 0.16 62)" },
  { value: "slate", label: "Slate", swatch: "oklch(0.6 0.035 250)" },
  { value: "indigo", label: "Indigo", swatch: "oklch(0.58 0.08 275)" },
  { value: "sage", label: "Sage", swatch: "oklch(0.64 0.055 150)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.63 0.07 15)" },
];

const DEFAULTS = { theme: "dark", primary_color: "amber", accent_color: "amber" };
const STORAGE_KEY = "instrumento.appearance";

const AppearanceContext = createContext({
  appearance: DEFAULTS,
  setAppearance: () => {},
});

function resolveTheme(theme) {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function apply(appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset["theme"] = resolveTheme(appearance.theme);
  root.dataset["primary"] = appearance.primary_color;
  root.dataset["accent"] = appearance.accent_color;
}

export function AppearanceProvider({ children }) {
  const [appearance, setState] = useState(DEFAULTS);

  // Local persistence (fallback when signed out) is read after hydration.
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored) {
        setState({ ...DEFAULTS, ...stored });
        return;
      }
    } catch {
      /* ignore */
    }
    apply(DEFAULTS);
  }, []);

  useEffect(() => {
    apply(appearance);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* ignore */
    }
  }, [appearance]);

  const setAppearance = useCallback((patch, { persistToAccount = true } = {}) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (persistToAccount) {
        fetch("/api/preferences", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(next),
        }).catch(() => {});
      }
      return next;
    });
  }, []);

  return (
    <AppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
