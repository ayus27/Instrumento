import { defineTool } from "@lovable.dev/mcp-js";

const INSTRUMENTS = [
  { id: "piano", name: "Piano", path: "/piano", type: "keyboard", polyphonic: true },
  { id: "guitar", name: "Guitar", path: "/guitar", type: "fretted", polyphonic: true },
  { id: "ukulele", name: "Ukulele", path: "/ukulele", type: "fretted", polyphonic: true },
  { id: "drums", name: "Drums", path: "/drums", type: "percussion", polyphonic: true },
];

export default defineTool({
  name: "list_instruments",
  title: "List instruments",
  description: "List the playable instruments available in Instrumento, with their routes and types.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(INSTRUMENTS, null, 2) }],
    structuredContent: { instruments: INSTRUMENTS },
  }),
});
