import React from "react";
import { useTheme } from "@/app/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md transition-all hover:text-white ${
          theme === "light"
            ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20 shadow-[0_0_8px_rgba(212,175,55,0.15)] font-bold"
            : "text-muted-foreground border border-transparent"
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md transition-all hover:text-white ${
          theme === "dark"
            ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20 shadow-[0_0_8px_rgba(212,175,55,0.15)] font-bold"
            : "text-muted-foreground border border-transparent"
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md transition-all hover:text-white ${
          theme === "system"
            ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20 shadow-[0_0_8px_rgba(212,175,55,0.15)] font-bold"
            : "text-muted-foreground border border-transparent"
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
