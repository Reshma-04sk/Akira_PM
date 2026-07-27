import React from "react";
import { Search } from "lucide-react";

export const SearchInput: React.FC = () => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        placeholder="Search project..."
        className="w-full pl-9 pr-12 py-1.5 text-xs bg-muted/40 border border-border rounded-lg placeholder-muted-foreground hover:bg-muted/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-all"
        aria-label="Search"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted border border-border rounded pointer-events-none select-none">
        ⌘K
      </kbd>
    </div>
  );
};
