export const SAMPLE_SONGS = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    artist: "John Newton (Public Domain)",
    album: "Traditional Hymns",
    key: "G",
    original_key: "G",
    bpm: 72,
    genre: "Folk / Traditional",
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "Amazing grace! How sweet the sound",
            chords: [{ chord: "G", position: 0 }, { chord: "C", position: 14 }, { chord: "G", position: 28 }]
          },
          {
            lyrics: "That saved a wretch like me!",
            chords: [{ chord: "D", position: 15 }]
          },
          {
            lyrics: "I once was lost, but now am found;",
            chords: [{ chord: "G", position: 0 }, { chord: "G7", position: 10 }, { chord: "C", position: 18 }, { chord: "G", position: 28 }]
          },
          {
            lyrics: "Was blind, but now I see.",
            chords: [{ chord: "Em", position: 4 }, { chord: "D", position: 15 }, { chord: "G", position: 20 }]
          }
        ]
      }
    ]
  },
  {
    id: "house-of-the-rising-sun",
    title: "House of the Rising Sun",
    artist: "Traditional Folk (Public Domain)",
    album: "Folk Classics",
    key: "Am",
    original_key: "Am",
    bpm: 116,
    genre: "Folk / Blues",
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "There is a house in New Orleans",
            chords: [{ chord: "Am", position: 0 }, { chord: "C", position: 9 }, { chord: "D", position: 17 }, { chord: "F", position: 24 }]
          },
          {
            lyrics: "They call the Rising Sun",
            chords: [{ chord: "Am", position: 0 }, { chord: "C", position: 10 }, { chord: "E", position: 18 }]
          },
          {
            lyrics: "And it's been the ruin of many a poor boy",
            chords: [{ chord: "Am", position: 0 }, { chord: "C", position: 13 }, { chord: "D", position: 22 }, { chord: "F", position: 33 }]
          },
          {
            lyrics: "And God, I know I'm one.",
            chords: [{ chord: "Am", position: 0 }, { chord: "E", position: 9 }, { chord: "Am", position: 17 }]
          }
        ]
      }
    ]
  },
  {
    id: "greensleeves",
    title: "Greensleeves",
    artist: "Traditional English Folk",
    album: "Renaissance Songs",
    key: "Am",
    original_key: "Am",
    bpm: 100,
    genre: "Classical / Folk",
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "Alas, my love, you do me wrong,",
            chords: [{ chord: "Am", position: 0 }, { chord: "C", position: 10 }, { chord: "G", position: 18 }, { chord: "Em", position: 25 }]
          },
          {
            lyrics: "To cast me off discourteously.",
            chords: [{ chord: "Am", position: 0 }, { chord: "E", position: 11 }, { chord: "Am", position: 21 }]
          }
        ]
      }
    ]
  }
];

export const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function transposeChord(chordStr, semitones) {
  if (!chordStr) return chordStr;
  const isMinor = chordStr.endsWith("m") && !chordStr.endsWith("Dim");
  const base = isMinor ? chordStr.slice(0, -1) : chordStr;
  
  const idx = CHROMATIC_NOTES.indexOf(base);
  if (idx === -1) return chordStr;

  const newIdx = (idx + semitones + 12) % 12;
  return CHROMATIC_NOTES[newIdx] + (isMinor ? "m" : "");
}
