import { useEffect, useRef } from "react";
import "emoji-picker-element";

interface UnicodeEmojiPanelProps {
  onPick: (unicode: string) => void;
}

export function UnicodeEmojiPanel({ onPick }: UnicodeEmojiPanelProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const picker = document.createElement("emoji-picker");
    picker.className = "unicode-emoji-picker-el";
    picker.setAttribute("data-theme", "dark");

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ unicode?: string; emoji?: { unicode?: string } }>)
        .detail;
      const unicode = detail?.unicode ?? detail?.emoji?.unicode;
      if (unicode) onPick(unicode);
    };

    picker.addEventListener("emoji-click", handler);
    host.appendChild(picker);

    return () => {
      picker.removeEventListener("emoji-click", handler);
      picker.remove();
    };
  }, [onPick]);

  return (
    <div
      ref={hostRef}
      className="unicode-emoji-panel-host overflow-hidden rounded-lg border border-border/50"
    />
  );
}
