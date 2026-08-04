import React from "react";
import { Search } from "lucide-react";

export const SearchInput: React.FC = () => {
  const handleClick = (e: React.MouseEvent | React.FocusEvent) => {
    e.preventDefault();
    // Dispatch custom event to trigger search palette modal
    window.dispatchEvent(new CustomEvent("akira-open-search"));
    if (e.target && "blur" in e.target) {
      (e.target as any).blur();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="relative w-full max-w-sm cursor-pointer"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        placeholder="Search project..."
        onFocus={handleClick}
        readOnly
        className="w-full pl-9 pr-12 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg placeholder-muted-foreground/60 hover:bg-white/10 hover:border-[#d4af37]/30 transition-all cursor-pointer"
        aria-label="Search"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground bg-[#0a0a0a] border border-white/10 rounded pointer-events-none select-none">
        ⌘K
      </kbd>
    </div>
  );
};
