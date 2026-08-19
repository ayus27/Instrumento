import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { midiToFrequency, nameToMidi } from "@/lib/audio/notes";

const TUNINGS: Record<string, string[]> = {
  guitar: ["E2", "A2", "D3", "G3", "B3", "E4"],
  ukulele: ["G4", "C4", "E4", "A4"],
};

export default defineTool({
  name: "get_tuning",
  title: "Get standard tuning",
  description:
    "Get the standard tuning for guitar or ukulele, including each string's note name and target frequency in Hz.",
  inputSchema: {
    instrument: z.enum(["guitar", "ukulele"]).describe("Which fretted instrument to tune."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ instrument }) => {
    const notes = TUNINGS[instrument];
    if (!notes) throw new ToolError(`Unknown instrument: ${instrument}`);
    const strings = notes.map((note, i) => ({
      string: i + 1,
      note,
      frequency: Number(midiToFrequency(nameToMidi(note)).toFixed(2)),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify({ instrument, strings }, null, 2) }],
      structuredContent: { instrument, strings },
    };
  },
});
