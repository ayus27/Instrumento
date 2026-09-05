/**
 * Instrumento Design Tokens
 * Single source of truth for spacing, color, typography, and animation values.
 * CSS custom properties remain the primary mechanism; this file provides
 * typed constants for use in component inline styles and calculations.
 */

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

/** Spacing scale (px). Use index 1–12. */
export const SPACE = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
  9: 96,
  10: 128,
  11: 160,
  12: 192,
} as const;

export type SpaceKey = keyof typeof SPACE;

/** Returns the spacing value in px for inline styles. */
export function space(key: SpaceKey): number {
  return SPACE[key];
}

// ---------------------------------------------------------------------------
// Colors — references to CSS custom properties
// ---------------------------------------------------------------------------

export const COLOR = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  panel: "var(--panel)",
  panelEdge: "var(--panel-edge)",
  signal: "var(--signal)",
  signalDim: "var(--signal-dim)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  keyWhite: "var(--key-white)",
  keyBlack: "var(--key-black)",

  // Studio-specific
  studioSurface: "var(--studio-surface)",
  studioSurfaceElevated: "var(--studio-surface-elevated)",
  studioBorder: "var(--studio-border)",
  studioTrack: "var(--studio-track)",
  studioClip: "var(--studio-clip)",
  studioPlayhead: "var(--studio-playhead)",
  studioRecording: "var(--studio-recording)",
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const FONT = {
  display: "var(--font-display)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
} as const;

export const TYPE = {
  /** Large display headings — instrument names, section titles */
  display: {
    fontFamily: FONT.display,
    letterSpacing: "-0.03em",
    fontWeight: 800,
  },
  /** Technical monospace labels — metadata, control labels */
  technical: {
    fontFamily: FONT.mono,
    fontSize: "0.6875rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  /** Small mono values — BPM, time, counts */
  value: {
    fontFamily: FONT.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.02em",
  },
} as const;

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

export const TIMING = {
  /** Micro-interactions: hover, button press, step toggle */
  micro: 120,
  /** Control state changes: mute, solo, mode switch */
  control: 150,
  /** Panel transitions: section open/close */
  panel: 200,
  /** Context transitions: page change, studio mode entry */
  context: 300,
} as const;

export const EASING = {
  /** Standard ease for most transitions */
  default: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Snappy feel for instrument interactions */
  snap: "cubic-bezier(0.2, 0, 0, 1)",
  /** Gentle for fading in */
  fadeIn: "cubic-bezier(0, 0, 0.2, 1)",
} as const;

// ---------------------------------------------------------------------------
// Studio layout
// ---------------------------------------------------------------------------

export const STUDIO = {
  sidebarWidth: 220,
  sidebarCollapsed: 48,
  trackHeight: 64,
  trackHeaderWidth: 200,
  timelineBarWidth: 120,
  playheadWidth: 2,
  mixerHeight: 180,
  transportHeight: 48,
  beatSubdivisions: 4,
} as const;
