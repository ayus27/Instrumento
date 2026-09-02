import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import {
  DRUM_PIECES,
  eventToKey,
  findConflict,
  keyLabel,
  pieceLabel,
  resetKeyMap,
  saveKeyMap,
} from "@/lib/drums/drumKeyMap";

/**
 * Key-remapping panel. While capturing a key it takes over the keyboard so
 * drums don't fire, and it refuses silent duplicate assignments.
 */
export function DrumKeySettings({ keyMap, onChange, onCapturingChange }) {
  const [capturing, setCapturing] = useState(null);
  const [conflict, setConflict] = useState(null);
  const capturingRef = useRef(null);
  capturingRef.current = capturing;

  useEffect(() => {
    onCapturingChange?.(Boolean(capturing) || Boolean(conflict));
  }, [capturing, conflict, onCapturingChange]);

  useEffect(() => {
    if (!capturing) return undefined;
    const onKeyDown = (event) => {
      event.preventDefault();
      const key = eventToKey(event);
      if (key === "escape") {
        setCapturing(null);
        return;
      }
      const pieceId = capturingRef.current;
      const owner = findConflict(keyMap, key, pieceId);
      if (owner) {
        setConflict({ pieceId, key, owner });
      } else {
        onChange({ ...keyMap, [pieceId]: key });
      }
      setCapturing(null);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [capturing, keyMap, onChange]);

  return (
    <div className="panel space-y-3 p-4">
      <p className="label-mono">Drum keyboard</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {DRUM_PIECES.map((piece) => (
          <div key={piece.id} className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-foreground">{piece.label}</span>
            <button
              type="button"
              className={`${controlButtonClass} min-w-28 ${capturing === piece.id ? "bg-signal text-primary-foreground" : ""}`}
              onClick={() => setCapturing(piece.id)}
            >
              {capturing === piece.id ? "Press any key…" : keyLabel(keyMap[piece.id])}
            </button>
          </div>
        ))}
      </div>

      {conflict && (
        <div
          role="alertdialog"
          className="border p-3 font-mono text-xs"
          style={{ borderColor: "var(--signal)" }}
        >
          <p>
            {keyLabel(conflict.key)} is already assigned to {pieceLabel(conflict.owner)}. Replace the{" "}
            {pieceLabel(conflict.owner)} mapping?
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" className={controlButtonClass} onClick={() => setConflict(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={controlButtonClass}
              onClick={() => {
                const next = { ...keyMap };
                next[conflict.owner] = "";
                next[conflict.pieceId] = conflict.key;
                onChange(next);
                setConflict(null);
              }}
            >
              Replace
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          className={controlButtonClass}
          onClick={() => {
            saveKeyMap(keyMap);
            toast.success("Drum keys saved");
          }}
        >
          Save
        </button>
        <button
          type="button"
          className={controlButtonClass}
          onClick={() => {
            const defaults = resetKeyMap();
            onChange(defaults);
            saveKeyMap(defaults);
            toast.success("Reset to default mapping");
          }}
        >
          Reset to default
        </button>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">
        Space, Enter, Shift, Ctrl, Alt and arrow keys are supported. Press Esc to cancel capture.
      </p>
    </div>
  );
}
