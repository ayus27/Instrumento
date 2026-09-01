export { transposeChord } from "./transposeChord";
export { SHARP_NOTES as CHROMATIC_NOTES } from "./transposeChord";

/**
 * Song shape:
 * { id, title, artist, language, genre, coverImage, originalKey, capo, tempo,
 *   sections: [{ type, lines: [{ lyrics, chords: [{ chord, position }] }] }] }
 * Chord positions are character offsets into the lyric line.
 * Only public-domain / traditional material is included here.
 */
export const SAMPLE_SONGS = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    artist: "John Newton (Public Domain)",
    language: "English",
    genre: "Folk / Traditional",
    coverImage: null,
    originalKey: "G",
    capo: 0,
    tempo: 72,
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "Amazing grace! How sweet the sound",
            chords: [
              { chord: "G", position: 0 },
              { chord: "C", position: 14 },
              { chord: "G", position: 28 },
            ],
          },
          { lyrics: "That saved a wretch like me!", chords: [{ chord: "D", position: 15 }] },
          {
            lyrics: "I once was lost, but now am found;",
            chords: [
              { chord: "G", position: 0 },
              { chord: "G7", position: 10 },
              { chord: "C", position: 18 },
              { chord: "G", position: 28 },
            ],
          },
          {
            lyrics: "Was blind, but now I see.",
            chords: [
              { chord: "Em", position: 4 },
              { chord: "D", position: 15 },
              { chord: "G", position: 20 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "house-of-the-rising-sun",
    title: "House of the Rising Sun",
    artist: "Traditional Folk (Public Domain)",
    language: "English",
    genre: "Folk / Blues",
    coverImage: null,
    originalKey: "Am",
    capo: 0,
    tempo: 116,
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "There is a house in New Orleans",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "C", position: 9 },
              { chord: "D", position: 17 },
              { chord: "F", position: 24 },
            ],
          },
          {
            lyrics: "They call the Rising Sun",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "C", position: 10 },
              { chord: "E", position: 18 },
            ],
          },
          {
            lyrics: "And it's been the ruin of many a poor boy",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "C", position: 13 },
              { chord: "D", position: 22 },
              { chord: "F", position: 33 },
            ],
          },
          {
            lyrics: "And God, I know I'm one.",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "E", position: 9 },
              { chord: "Am", position: 17 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "greensleeves",
    title: "Greensleeves",
    artist: "Traditional English Folk",
    language: "English",
    genre: "Classical / Folk",
    coverImage: null,
    originalKey: "Am",
    capo: 0,
    tempo: 100,
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "Alas, my love, you do me wrong,",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "C", position: 10 },
              { chord: "G", position: 18 },
              { chord: "Em", position: 25 },
            ],
          },
          {
            lyrics: "To cast me off discourteously.",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "E", position: 11 },
              { chord: "Am", position: 21 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "resham-firiri",
    title: "Resham Firiri",
    artist: "Nepali Folk (Traditional)",
    language: "Nepali",
    genre: "Folk / Lok Geet",
    coverImage: null,
    originalKey: "G",
    capo: 2,
    tempo: 120,
    sections: [
      {
        type: "Chorus",
        lines: [
          {
            lyrics: "Resham firiri, resham firiri",
            chords: [
              { chord: "G", position: 0 },
              { chord: "D", position: 14 },
            ],
          },
          {
            lyrics: "Udera jaunki dandama bhanjyang, resham firiri",
            chords: [
              { chord: "C", position: 0 },
              { chord: "G", position: 20 },
              { chord: "D", position: 33 },
              { chord: "G", position: 41 },
            ],
          },
        ],
      },
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "Ek nale banduk, dui nale banduk",
            chords: [
              { chord: "G", position: 0 },
              { chord: "C", position: 16 },
            ],
          },
          {
            lyrics: "Mirgalai takeko, mirgalai maile takeko hoina",
            chords: [
              { chord: "D", position: 0 },
              { chord: "G", position: 17 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "simsime-pani",
    title: "Simsime Pani (Folk Arrangement)",
    artist: "Nepali Folk (Traditional)",
    language: "Nepali",
    genre: "Folk / Lok Geet",
    coverImage: null,
    originalKey: "Am",
    capo: 0,
    tempo: 96,
    sections: [
      {
        type: "Chorus",
        lines: [
          {
            lyrics: "Simsime pani ma, timro yaad aayo",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "F", position: 14 },
              { chord: "G", position: 24 },
            ],
          },
          {
            lyrics: "Bataas sangai, maya udera aayo",
            chords: [
              { chord: "C", position: 0 },
              { chord: "G", position: 14 },
              { chord: "Am", position: 25 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "raghupati-raghav",
    title: "Raghupati Raghav Raja Ram",
    artist: "Traditional Bhajan (Public Domain)",
    language: "Hindi",
    genre: "Bhajan / Devotional",
    coverImage: null,
    originalKey: "C",
    capo: 0,
    tempo: 84,
    sections: [
      {
        type: "Chorus",
        lines: [
          {
            lyrics: "Raghupati Raghav Raja Ram",
            chords: [
              { chord: "C", position: 0 },
              { chord: "F", position: 10 },
              { chord: "G", position: 20 },
            ],
          },
          {
            lyrics: "Patita paavana Sita Ram",
            chords: [
              { chord: "Am", position: 0 },
              { chord: "F", position: 12 },
              { chord: "C", position: 19 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sare-jahan-se-achha",
    title: "Sare Jahan Se Achha",
    artist: "Muhammad Iqbal, 1904 (Public Domain)",
    language: "Hindi",
    genre: "Patriotic / Classical",
    coverImage: null,
    originalKey: "D",
    capo: 0,
    tempo: 88,
    sections: [
      {
        type: "Verse 1",
        lines: [
          {
            lyrics: "Sare jahan se achha, Hindustan hamara",
            chords: [
              { chord: "D", position: 0 },
              { chord: "G", position: 16 },
              { chord: "A", position: 28 },
            ],
          },
          {
            lyrics: "Hum bulbulein hain iski, ye gulsitan hamara",
            chords: [
              { chord: "Bm", position: 0 },
              { chord: "G", position: 18 },
              { chord: "A", position: 30 },
              { chord: "D", position: 39 },
            ],
          },
        ],
      },
    ],
  },
];
