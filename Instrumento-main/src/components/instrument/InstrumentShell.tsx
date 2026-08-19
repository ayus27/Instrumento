import type { ReactNode } from "react";
import type { InstrumentStatus } from "@/hooks/useInstrument";
import { controlButtonClass } from "./ControlBar";

type Props = {
  title: string;
  subtitle: string;
  status: InstrumentStatus;
  error: string | null;
  onEnable: () => void;
  children: ReactNode;
  controls?: ReactNode;
  legend?: ReactNode;
};

export function InstrumentShell({
  title,
  subtitle,
  status,
  error,
  onEnable,
  children,
  controls,
  legend,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <header className="hairline flex flex-wrap items-end justify-between gap-4 pb-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">{title}</h1>
          <p className="label-mono mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="label-mono" aria-live="polite">
            {status === "ready"
              ? "Audio ready"
              : status === "loading"
                ? "Loading instrument…"
                : status === "error"
                  ? "Audio unavailable"
                  : "Audio idle"}
          </span>
          {status !== "ready" && (
            <button type="button" className={controlButtonClass} onClick={onEnable}>
              Enable audio
            </button>
          )}
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-4 border p-3 font-mono text-xs"
          style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
        >
          {error} — click “Enable audio” to retry.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {controls}
        <div className="panel p-4">{children}</div>
        {legend}
      </div>
    </div>
  );
}
