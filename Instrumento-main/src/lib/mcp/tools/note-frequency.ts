import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { centsOff, midiToFrequency, midiToName, nameToMidi } from "@/lib/audio/notes";

export default defineTool({
  name: "note_frequency",
  title: "Note frequency",
  description:
    "Convert a note name (e.g. A4, C#3) to its MIDI number and frequency in Hz, optionally comparing a measured frequency in cents.",
  inputSchema: {
    note: z.string().trim().min(1).describe("Note name with octave, e.g. 'A4' or 'F#2'."),
    measuredHz: z
      .number()
      .positive()
      .optional()
      .describe("Optional measured frequency to compare against the target note."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ note, measuredHz }) => {
    let midi: number;
    try {
      midi = nameToMidi(note);
    } catch {
      throw new ToolError(`Invalid note name: ${note}`);
    }
    const frequency = Number(midiToFrequency(midi).toFixed(3));
    const result: Record<string, unknown> = { note: midiToName(midi), midi, frequency };
    if (measuredHz !== undefined) {
      result['measuredHz'] = measuredHz;
      result['cents'] = Number(centsOff(measuredHz, frequency).toFixed(1));
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
