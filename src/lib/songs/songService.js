import { SAMPLE_SONGS } from "./sampleSongs";

/**
 * Single source of truth for song data. Today it reads from a local catalog;
 * swapping in a database/API only requires changing these functions.
 */
export const LANGUAGES = ["All", "English", "Nepali", "Hindi"];

function normalise(song) {
  return {
    id: song.id,
    title: song.title ?? "Untitled",
    artist: song.artist ?? "Unknown",
    language: song.language ?? "English",
    genre: song.genre ?? "",
    coverImage: song.coverImage ?? null,
    originalKey: song.originalKey ?? song.key ?? "C",
    capo: Number(song.capo ?? 0),
    tempo: Number(song.tempo ?? song.bpm ?? 0),
    sections: Array.isArray(song.sections) ? song.sections : [],
  };
}

export function getSongs(options = {}) {
  const { search = "", language = "All" } = options;
  const query = search.trim().toLowerCase();
  return SAMPLE_SONGS.map(normalise).filter((song) => {
    const languageOk = language === "All" || song.language === language;
    const searchOk =
      !query ||
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query);
    return languageOk && searchOk;
  });
}

export function getSongById(id) {
  const found = SAMPLE_SONGS.find((s) => s.id === id);
  return found ? normalise(found) : null;
}

export function getLanguages() {
  const set = new Set(SAMPLE_SONGS.map((s) => s.language ?? "English"));
  return ["All", ...[...set].sort()];
}
