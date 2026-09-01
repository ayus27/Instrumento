export const STORAGE_KEY = "instrumento:drum-key-map";

/** Drum pieces available in the audio engine. */
export const DRUM_PIECES = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "hihat", label: "Hi-Hat" },
  { id: "openhat", label: "Open Hi-Hat" },
  { id: "tom", label: "Tom" },
  { id: "crash", label: "Crash" },
  { id: "ride", label: "Ride" },
];

export const DEFAULT_KEY_MAP = {
  kick: "space",
  snare: "s",
  hihat: "h",
  openhat: "o",
  tom: "t",
  crash: "c",
  ride: "r",
};

const SPECIAL_LABELS = {
  space: "Space",
  enter: "Enter",
  tab: "Tab",
  escape: "Esc",
  backspace: "Backspace",
  shift: "Shift",
  control: "Ctrl",
  alt: "Alt",
  arrowup: "↑ Up",
  arrowdown: "↓ Down",
  arrowleft: "← Left",
  arrowright: "→ Right",
};

/** Turn a KeyboardEvent into our normalised key token. */
export function eventToKey(event) {
  if (event.key === " ") return "space";
  return event.key.toLowerCase();
}

export function keyLabel(key) {
  if (!key) return "—";
  return SPECIAL_LABELS[key] ?? key.toUpperCase();
}

export function isValidKeyMap(value) {
  if (!value || typeof value !== "object") return false;
  return DRUM_PIECES.every(
    (piece) => typeof value[piece.id] === "string" && value[piece.id].length > 0,
  );
}

export function loadKeyMap() {
  if (typeof window === "undefined") return { ...DEFAULT_KEY_MAP };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_KEY_MAP };
    const parsed = JSON.parse(raw);
    if (!isValidKeyMap(parsed)) return { ...DEFAULT_KEY_MAP };
    const clean = {};
    for (const piece of DRUM_PIECES) clean[piece.id] = parsed[piece.id];
    return clean;
  } catch {
    return { ...DEFAULT_KEY_MAP };
  }
}

export function saveKeyMap(map) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — keep in-memory map */
  }
}

export function resetKeyMap() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return { ...DEFAULT_KEY_MAP };
}

/** Which piece (if any) already owns this key. */
export function findConflict(map, key, exceptPieceId) {
  return (
    DRUM_PIECES.find((piece) => piece.id !== exceptPieceId && map[piece.id] === key)?.id ?? null
  );
}

export function pieceLabel(id) {
  return DRUM_PIECES.find((p) => p.id === id)?.label ?? id;
}
