import React from "react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const suggestions = [
    "What is blocking this sprint?",
    "Summarize current sprint velocity",
    "Find tasks with high priority",
    "Generate team standup digest",
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#07090d]/60 backdrop-blur-sm select-none">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Palette window */}
      <div 
        style={{ transform: "translateZ(30px)" }}
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#0c0f14] shadow-2xl p-4 flex flex-col gap-4 text-left transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Input area */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <span className="text-sm text-[#7c8cff] font-semibold">✦</span>
          <input
            type="text"
            placeholder="Ask Akira anything..."
            className="flex-grow bg-transparent border-none outline-none text-xs text-[#f4f7fa] placeholder-gray-500 font-sans"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="text-[10px] text-gray-500 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/5"
          >
            esc
          </button>
        </div>

        {/* Suggestions list */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider px-1">
            Suggested actions
          </span>
          <div className="flex flex-col gap-1">
            {suggestions.map((sug, i) => (
              <div
                key={i}
                onClick={onClose}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#7c8cff]/10 hover:text-[#7c8cff] text-[11px] text-[#8b95a5] font-semibold transition-colors cursor-pointer"
              >
                <span>&bull;</span>
                <span>{sug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer command shortcut list */}
        <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono pt-1 border-t border-white/5">
          <span>Use &uarr; &darr; keys to navigate</span>
          <span>↵ to execute</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
