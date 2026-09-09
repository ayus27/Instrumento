import { ReactNode } from "react";
import { StudioToolbar, TransportControls } from "./StudioToolbar";

interface StudioShellProps {
  children: ReactNode;
  bottomPanel?: ReactNode;
}

export function StudioShell({ children, bottomPanel }: StudioShellProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-studio-surface text-foreground font-sans">
      <StudioToolbar />
      <TransportControls />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main timeline area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
      
      {/* Resizable bottom panel for editors/mixer */}
      {bottomPanel && (
        <div className="h-64 border-t border-border bg-studio-surface-elevated">
          {bottomPanel}
        </div>
      )}
    </div>
  );
}
