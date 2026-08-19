import { useEffect, useRef } from "react";

/**
 * Central keyboard input manager: one listener pair per instrument page.
 * Ignores auto-repeat and typing inside form fields.
 */
export function useKeyboardInput(options: {
  onDown: (key: string) => void;
  onUp: (key: string) => void;
  enabled?: boolean;
}) {
  const ref = useRef(options);
  ref.current = options;

  useEffect(() => {
    const isTyping = (target: EventTarget | null) =>
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    const down = (event: KeyboardEvent) => {
      if (ref.current.enabled === false || event.repeat || isTyping(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key === " " ? "space" : event.key.toLowerCase();
      ref.current.onDown(key);
    };
    const up = (event: KeyboardEvent) => {
      if (ref.current.enabled === false || isTyping(event.target)) return;
      const key = event.key === " " ? "space" : event.key.toLowerCase();
      ref.current.onUp(key);
    };
    const blur = () => ref.current.onUp("__blur__");

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}
