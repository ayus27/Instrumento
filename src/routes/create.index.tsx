import { createFileRoute } from "@tanstack/react-router";
import { StudioProjectProvider } from "@/features/studio/hooks/useStudioProject";
import { StudioShell } from "@/features/studio/components/StudioShell";
import { Timeline } from "@/features/studio/components/Timeline";

export const Route = createFileRoute("/create/")({
  head: () => ({
    meta: [
      { title: "Studio — Instrumento" },
      { name: "description", content: "Browser-based DAW" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  return (
    <StudioProjectProvider>
      <StudioShell bottomPanel={<div className="p-4 text-muted-foreground">Piano Roll / Editor Placeholder</div>}>
        <div className="flex h-full w-full">
          {/* Track Headers List Placeholder */}
          <div className="w-64 flex-shrink-0 border-r border-border bg-studio-surface-elevated">
            <div className="h-8 border-b border-border bg-studio-surface-elevated/80"></div>
            <div className="p-4 text-sm text-muted-foreground">Track List</div>
          </div>
          
          {/* Timeline */}
          <div className="flex-1 overflow-hidden">
            <Timeline />
          </div>
        </div>
      </StudioShell>
    </StudioProjectProvider>
  );
}
