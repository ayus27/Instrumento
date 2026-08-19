import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listInstruments from "./tools/list-instruments";
import getTuning from "./tools/get-tuning";
import noteFrequency from "./tools/note-frequency";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "playable-instruments",
  title: "Playable Instruments",
  version: "0.1.0",
  instructions:
    "Tools for Instrumento, a browser instrument studio. Use `list_instruments` to see playable instruments, `get_tuning` for standard guitar/ukulele tunings, and `note_frequency` for note/frequency conversions and cent offsets.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listInstruments, getTuning, noteFrequency] as unknown as Parameters<
    typeof defineMcp
  >[0]["tools"],

});
