import React from "react";
import { Terminal } from "lucide-react";

export const CommandPaletteButton: React.FC = () => {
  return (
    <button
      onClick={() => console.log("Open Command Palette")}
      className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-muted-foreground border border-border bg-card/30 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-48 text-left"
      aria-label="Open command menu"
    >
      <div className="flex items-center gap-1.5">
        <Terminal className="h-3.5 w-3.5" />
        <span>Command Menu</span>
      </div>
      <kbd className="px-1.5 py-0.5 text-[9px] bg-muted border border-border rounded pointer-events-none select-none font-sans">
        ⌘P
      </kbd>
    </button>
  );
};
